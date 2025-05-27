{
  description = "Nx Monorepo (Node.js 20) development environment and runner";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = {nixpkgs, ...}: let
    systems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
    forAllSystems = nixpkgs.lib.genAttrs systems;

    # Helper function to generate outputs per system
    perSystem = system: let
      pkgs = import nixpkgs {inherit system;};
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

        echo "Running 'npx nx run @notlegaladvice/server:serve:development'..."
        # Use exec to replace the script process, pass arguments
        # Ensure npx is found via the PATH set by the wrapper

        export GOOGLE_AI_MODEL=gemini-2.0-flash
        export OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger-collector-service:4317
        export OTEL_SERVICE_NAME=notlegaladvice
        export GOOGLE_API_KEY=<YOUR-GOOGLE-API-KEY>
        export MONGO_USER_PASSWORD=<YOUR-MONGO-USER-PASSWORD>

        exec npx nx run @notlegaladvice/server:serve:development "$@"
      '';

      appRunnerScriptDrv = pkgs.writeShellScriptBin "run-server-app" ''
        #!${pkgs.bash}/bin/bash
        set -e
        # Add nodejs bin directory to the PATH for this script's execution context
        export PATH="${pkgs.lib.makeBinPath [pkgs.nodejs_20]}:$PATH"
        # Execute the actual logic script, passing arguments
        exec "${startLogicScriptDrv}/bin/start-server-impl" "$@"
      '';
    in {
      devShell = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs_20
          pkgs.corepack_20
          pkgs.docker_28
          pkgs.bash
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
  in {
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
