{
  description = "Typescript-Node DevShell";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
    mdvalidate.url = "github:404wolf/mdvalidate";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      mdvalidate,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells = {
          default = pkgs.mkShell {
            packages =
              (with pkgs; [
                nodejs
                bun
                prettierd
                flyctl
              ])
              ++ [
                mdvalidate.packages.${system}.default
              ];
          };
        };
      }
    );
}
