#!/bin/bash


#
# GNOME Shell Extension Installer
#


metadata() {
	cat metadata.json | python -c "import json,sys; obj=json.load(sys.stdin); print obj['$1']"
}



EXT_UUID=$( metadata "uuid" )
EXT_NAME=$( metadata "name" )
EXT_VERSION=$( metadata "version" )
EXT_SHELL_VERSIONS=$( metadata "shell-version" )

SHELL_VERSION="$( grep -oP "[0-9]+\.[0-9]+" <<< "$( gnome-shell --version )" )"

[[ $EUID -eq 0 ]] &&
	SHELL_EXTENSIONS_PATH="/usr/share/gnome-shell/extensions" ||
	SHELL_EXTENSIONS_PATH="$HOME/.local/share/gnome-shell/extensions"

EXT_PATH="$SHELL_EXTENSIONS_PATH/$EXT_UUID"


install() {
	if [ -e $EXT_PATH ]; then
		rm -R -f "$EXT_PATH"
	fi

	mkdir -p "$EXT_PATH"
	cp -R ./ "$EXT_PATH/"

	if [ $EUID -eq 0 ]; then
		chmod -R 0644 "$EXT_PATH/*"
	fi
}

enable() {
	if [  -z "$ENABLED_EXTENSIONS" ]; then
		gsettings set org.gnome.shell enabled-extensions "['$EXT_UUID']"
	else
		gsettings set org.gnome.shell enabled-extensions "[${ENABLED_EXTENSIONS}, '$EXT_UUID']"
	fi
}

restart() {
	dbus-send --session --type=method_call \
              --dest=org.gnome.Shell /org/gnome/Shell \
              org.gnome.Shell.Eval string:"global.reexec_self();"
}


# Welcome
echo "'$EXT_NAME ($EXT_VERSION)' GNOME Shell extension installer."


# Install
echo
echo "Extension will be installed in '$EXT_PATH'"


if [ -e $EXT_PATH ]; then
	echo "WARNING: all existing data will be lost!"
	read -p "Continue (y/N)? " yesno
else
	read -p "Install (y/N)? " yesno
fi

case "$yesno" in
	y|Y )	echo -n "Installing..."
			install
			echo " done"
			;;
	* )		echo "Skipping..."
			exit;;
esac

if [ $EUID -eq 0 ]; then
	exit;
fi


# Enable
ENABLED_EXTENSIONS=$( gsettings get org.gnome.shell enabled-extensions |
                          cut -f 1 -d "[" --complement )
ENABLED_EXTENSIONS=${ENABLED_EXTENSIONS%?}
if [ -z "$( echo "$ENABLED_EXTENSIONS" | grep "$EXT_UUID" )" ]; then
	echo
	read -p "Enable '$EXT_NAME ($EXT_VERSION)' (y/N)? " yesno

	case "$yesno" in
		y|Y )	echo -n "Enabling..."
				enable
				echo " done"
				;;
		* )		echo "Skipping..."
				exit;;
	esac
fi


# Restart GNOME Shell
echo
read -p "Restart GNOME Shell (y/N)? " yseno

case "$yesno" in
	y|Y )	echo -n "Restarting..."
			restart
			echo " done"
			;;
	* )		echo "Skipping..."
			exit;;
esac

