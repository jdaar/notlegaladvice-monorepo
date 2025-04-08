{
  description = "Nx Monorepo (Node.js 20) development environment and runner";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs, ... }@attrs:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;

      # Helper function to generate outputs per system
      perSystem = system:
        let
          pkgs = import nixpkgs { inherit system; };

          # 1. The core logic script (install deps, run nx)
          #    This script EXPECTS node/npm/npx to be in the PATH when it runs.
          startLogicScriptDrv = pkgs.writeShellScriptBin "start-server-impl" ''
            #!/usr/bin/env bash
            set -e # Exit immediately if a command exits with a non-zero status.

            # Running from the monorepo root (where flake.nix is)
            MONOREPO_ROOT=$(pwd)
            echo "Working directory: $MONOREPO_ROOT"

            NEEDS_INSTALL=false
            if [ ! -d "$MONOREPO_ROOT/node_modules" ]; then
              echo "'node_modules' not found in root."
              NEEDS_INSTALL=true
            elif [ "$MONOREPO_ROOT/package.json" -nt "$MONOREPO_ROOT/node_modules" ]; then
              echo "Root 'package.json' is newer than 'node_modules'."
              NEEDS_INSTALL=true
            elif [ -f "$MONOREPO_ROOT/package-lock.json" ] && [ "$MONOREPO_ROOT/package-lock.json" -nt "$MONOREPO_ROOT/node_modules" ]; then
              echo "Root 'package-lock.json' is newer than 'node_modules'."
              NEEDS_INSTALL=true
            fi

            if [ "$NEEDS_INSTALL" = true ] ; then
              echo "Running 'npm install' in root..."
              # Use --legacy-peer-deps potentially, if needed for your project
              if npm install; then
                 # Consider adding --ignore-scripts here if install scripts cause issues in Nix
                echo "Root dependencies installed successfully."
              else
                echo "ERROR: 'npm install' failed." >&2
                exit 1
              fi
            else
              echo "Root dependencies appear up to date. Skipping 'npm install'."
            fi

            echo "Running 'npx nx serve server'..."
            # Use exec to replace the script process, pass arguments
            # Ensure npx is found via the PATH set by the wrapper
            exec npx nx start server "$@"
          '';

          # 2. The wrapper script used by `nix run`
          #    This script sets up the PATH and then calls the logic script.
          appRunnerScriptDrv = pkgs.writeShellScriptBin "run-server-app" ''
            #!${pkgs.bash}/bin/bash
            set -e
            # Add nodejs bin directory to the PATH for this script's execution context
            export PATH="${pkgs.lib.makeBinPath [ pkgs.nodejs_20 ]}:$PATH"
            # Execute the actual logic script, passing arguments
            exec "${startLogicScriptDrv}/bin/start-server-impl" "$@"
          '';

        in
        {
          # Define the devShell
          # It needs nodejs AND the *logic* script (start-server-impl) available directly
          # We rename the user-facing command in the shell for consistency.
          devShell = pkgs.mkShell {
            buildInputs = [
              pkgs.nodejs_20
              pkgs.corepack_20
              pkgs.bash
              # Add a symlink or simple script named 'start-server' in the shell
              # that points to the implementation script.
              (pkgs.writeShellScriptBin "start-server" ''
                #!${pkgs.bash}/bin/bash
                exec "${startLogicScriptDrv}/bin/start-server-impl" "$@"
              '')
            ];

            shellHook = ''
              echo "Nx Monorepo development environment"
              node --version
              npm --version
              echo "Run 'start-server' to install dependencies (if needed) and run the 'server' app via Nx"
            '';
          };

          # Define the app - it points to the WRAPPER script
          app = {
            type = "app";
            # The program for `nix run` is the wrapper that sets the PATH
            program = "${appRunnerScriptDrv}/bin/run-server-app";
          };
        };

      # Generate outputs for all systems
      allSystemsOutputs = forAllSystems perSystem;

    in
    {
      # Structure outputs
      devShells = forAllSystems (system: {
        default = allSystemsOutputs.${system}.devShell;
      });

      apps = forAllSystems (system: {
        # Keep the app name 'server' for `nix run .#server`
        server = allSystemsOutputs.${system}.app;
      });
    };
}
