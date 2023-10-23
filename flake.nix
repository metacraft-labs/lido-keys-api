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
        yarn = pkgs.yarn.override {inherit nodejs;};
        defaultPackages = [nodejs yarn];
        lido-keys-api = pkgs.callPackage ./yarn-project.nix {inherit nodejs;} {
          src = pkgs.lib.cleanSource ./.;
          overrideAttrs = super: {
            name = "lido-keys-api";
            buildInputs = super.buildInputs ++ [pkgs.python3];
            buildPhase = ''
              yarn typechain
              # yarn postinstall
              # yarn build
            '';
            dontFixup = true;
          };
        };
      in {
        packages = {
          inherit lido-keys-api;
          default = lido-keys-api;
        };
        devShells.default = pkgs.mkShellNoCC {packages = defaultPackages;};
        devShells.full = pkgs.mkShellNoCC {packages = defaultPackages ++ [lido-keys-api];};
      };
    };
}
