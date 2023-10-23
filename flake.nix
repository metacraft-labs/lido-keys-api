{
  description = "Lido Keys Api";

  inputs = {
    nixpkgs.url = github:NixOS/nixpkgs/nixos-23.05;

    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
  };

  outputs = inputs @ {flake-parts, ...}:
    flake-parts.lib.mkFlake {inherit inputs;} {
      systems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
      perSystem = {pkgs, ...}: let
        nodejs = pkgs.nodejs_20;
        yarn = pkgs.writeShellScriptBin "yarn" ''
          exec '${nodejs}/bin/node' '${./.yarn/releases/yarn-3.6.4.cjs}' "$@"
        '';
        defaultPackages = [nodejs yarn];

        src = pkgs.lib.sourceByRegex ./. [
          "\.yarn(/releases.*)?"
          "\.yarn(/plugins.*)?"
          "package\.json"
          "yarn\.lock"
          "\.yarnrc\.yml"
        ];

        lido-keys-api-deps = pkgs.callPackage ./yarn-project.nix {inherit nodejs;} {
          inherit src;
          overrideAttrs = super: {
            name = "lido-keys-api";
            buildInputs = super.buildInputs ++ [pkgs.python3];
            dontFixup = true;
          };
        };
        lido-keys-api = pkgs.runCommand "lido-keys-api build scripts" {} ''
          mkdir -p $out
          touch $out/example
          ls -la ${lido-keys-api-deps}
          # yarn typechain
          # yarn chronix:compile
          yarn build
        '';
      in {
        packages = {
          inherit lido-keys-api lido-keys-api-deps;
          default = lido-keys-api;
        };
        devShells.default = pkgs.mkShellNoCC {packages = defaultPackages;};
        devShells.full = pkgs.mkShellNoCC {packages = defaultPackages ++ [lido-keys-api];};
      };
    };
}
