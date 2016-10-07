
const Gio = imports.gi.Gio;
const GnomeBluetooth = imports.gi.GnomeBluetooth;
const Lang = imports.lang;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;


const BUS_NAME = 'org.gnome.SettingsDaemon.Rfkill';
const OBJECT_PATH = '/org/gnome/SettingsDaemon/Rfkill';

const RfkillManagerInterface = '<node> \
<interface name="org.gnome.SettingsDaemon.Rfkill"> \
<property name="BluetoothAirplaneMode" type="b" access="readwrite" /> \
<property name="BluetoothHasAirplaneMode" type="b" access="read" /> \
</interface> \
</node>';

const RfkillManagerProxy = Gio.DBusProxy.makeProxyWrapper(RfkillManagerInterface);


const Me = imports.misc.extensionUtils.getCurrentExtension();
const console = Me.imports.console;


let aggregateMenu;
let btIndicator;
let proxy;

let toggleItem;
// let turnOnItem;


// Disable debug mode
console.enabled = false;


// EXTENSION INIT
function init() {
	console.info("init()");

	aggregateMenu = Main.panel.statusArea["aggregateMenu"];
	btIndicator = aggregateMenu._bluetooth;

	console.info("init()");
}


// EXTENSION ENABLE
function enable() {
	console.info("enable()");

	// proxy
	proxy = new RfkillManagerProxy(Gio.DBus.session, BUS_NAME, OBJECT_PATH, function(proxy, error) {
		if (error) {
			log(error.message);
			return;
		}
		console.info("proxy");
		sync();
	});

	proxy.connect('g-properties-changed', function(proxy) {
		console.info("proxy.g-properties-changed");
		sync();
	});

	// toggleItem
	toggleItem = btIndicator._item.menu.firstMenuItem;

	// "Turn on" menu item
	// turnOnItem = new PopupMenu.PopupMenuItem(_("Turn On"));
	// turnOnItem.actor.visible = false;
	// btIndicator._item.menu.addMenuItem(turnOnItem, 0);

	// Bluetooth
	let client = new GnomeBluetooth.Client();
	let model = client.get_model();

	model.connect('row-changed', function() {
		console.info("model.row-changed");
		sync();
	});
	model.connect('row-deleted', function() {
		console.info("model.row-deleted");
		sync();
	});
	model.connect('row-inserted', function() {
		console.info("model.row-inserted");
		sync();
	});
	Main.sessionMode.connect('updated', function() {
		console.info("Main.sessionMode.updated");
		sync();
	});

	sync();

	console.info("/enable()");
}


// EXTENSION DISABLE
function disable() {
	console.info("disable()");

	var btEnabled = ! proxy.BluetoothAirplaneMode;
	if (btEnabled) {
		// Bluetooth in ON
	}
	else {
		// Bluetooth is OFF
		btIndicator._item.actor.visible = false;
	}

	console.info("/disable()");
}


// MENU SYNC
function sync() {
	console.info("sync()");

	var btEnabled = ! proxy.BluetoothAirplaneMode;
	if (btEnabled) {
		// Bluetooth in ON
		toggleItem.actor.visible = true;
	}
	else {
		// Bluetooth is OFF
		btIndicator._item.actor.visible = true;
		btIndicator._item.label.text = _("%s Off").format(_("Bluetooth"));
		toggleItem.actor.visible = false;
	}

	console.info("/sync()");
}
