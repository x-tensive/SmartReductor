This is a command line tool that install virtual demo factory codename "SmartReductor". It utilizes [DPA](https://dpa-xt.com) REST API to create, update or delete objects.

[![build and publish](https://github.com/x-tensive/SmartReductor/actions/workflows/build%20and%20publish.yml/badge.svg)](https://github.com/x-tensive/SmartReductor/actions/workflows/build%20and%20publish.yml)

## Install

```sh
npm install @xtensive-dpa/smartreductor
```

## Usage

```sh
npx smartreductor import all --url <dpahosturl> --user <username> --password <userpassword>
```

for instance:

```sh
npx smartreductor import all --url http://localhost --user admin --password xxx
```

for a list of other commands and subcommands:

```sh
npx smartreductor --help
npx smartreductor <command> --help
```
