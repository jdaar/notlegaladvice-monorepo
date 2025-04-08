{
  description = "Node.js 20 development environment with dependency installation";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs, ... }: {
    devShells = let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
      forAllSystems (system: let
        pkgs = import nixpkgs {
          inherit system;
        };
      in {
        default = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_20
            (pkgs.writeShellScriptBin "start" ''
              echo "Ensuring dependencies are installed..."
              npm install
              echo "Starting the application..."
              npm run start
            '')
          ];

          shellHook = ''
            echo "Node.js development environment"
            node --version
            npm --version
            echo "Run 'start' to install dependencies (if needed) and execute npm run start"
          '';
        };
      });

    # 'nix run .#start'
    apps = let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
      forAllSystems (system: {
        start = {
          type = "app";
          program = "${self.devShells.${system}.default}/bin/start";
        };
      });
  };
}
