#!/bin/bash

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
# Simple script to execute project commands. |
# Run ./x to get started!                    |
# Authored by Jacob Humston                  |
# (c) GNU GENERAL PUBLIC LICENSE             |
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

# Define some color variables.
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NO_COLOR='\033[0m'

# Ensure the script is run from its own directory.
script_dir="$(cd "$(dirname "$0")" && pwd)"
if [ "$PWD" != "$script_dir" ]; then
    echo -e "${RED}This script must be run from it's own directory.${NO_COLOR} ($script_dir)"
    exit 1
fi

# Define our modules directory.
modules="./node_modules/.bin/"

# A table of commands that can be executed.
declare -A commands
    commands["start"]="bun run src/server/index.ts"
    commands["format"]="${modules}prettier --cache --write ."
    
    # Short form alias for already defined commands.
    commands["f"]="${commands["format"]}"

# Simple help function to display available commands.
print_help() {
    echo -e "${GREEN}Usage:${NO_COLOR} $0 <command>"
    echo -e "${GREEN}Available commands:${NO_COLOR}"
    for key in "${!commands[@]}"; do
        echo -n " $key"
    done
    echo ""
}

# Declare the command to run.
command_to_run="$1"
shift # We need to shift to prevent the command from being passed as an argument to the command itself.

# Make sure a command was specified.
if [ -z "$command_to_run" ]; then
    echo -e "${RED}No command specified.${NO_COLOR}"
    print_help
    exit 1
fi

# Check if the command exists.
if [ -z "${commands[$command_to_run]}" ]; then
    echo -e "${RED}Command not found: ${YELLOW}$command_to_run${NO_COLOR}"
    print_help
    exit 1
fi

# Echo some information about the command, then run it.
echo -e "${GREEN}Running command:${NO_COLOR} $command_to_run"
echo -e "${GREEN}>${YELLOW} ${commands[${command_to_run}]} $@${NO_COLOR}"
eval "${commands[${command_to_run}]} $@"