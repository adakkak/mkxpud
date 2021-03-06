// Get the root branch
var xpudPrefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefBranch);

function check_enc(num) {
	if (document.getElementById('wifi_connect')) {
	document.getElementById('wifi_connect').disabled = false;
	}
	var enc = document.getElementById('ap-option').options[num].getAttribute('class').toString();
	document.getElementById('enctype').value = enc;
	switch (enc) {
	case 'wifi-wep': // WEP
		document.getElementById('ssid').disabled = true;
		document.getElementById('passwd').disabled = false;
		document.getElementById('ssid-line').style.display = 'none';
		break;
	case 'wifi-wpa': // WPA
		document.getElementById('ssid').disabled = true;
		document.getElementById('passwd').disabled = false;
		document.getElementById('ssid-line').style.display = 'none';
		break;
	case 'wifi-wpa-hidden': // WPA-HIDDEN
		document.getElementById('passwd').disabled = false;
		document.getElementById('ssid').disabled = false;
		document.getElementById('ssid-line').style.display = 'block';
		break;
	case 'wifi-hidden': // hidden node
		document.getElementById('ssid').disabled = true;	
		document.getElementById('passwd').disabled = false;
		document.getElementById('ssid-line').style.display = 'block';
		break;
	default: // none 
		document.getElementById('ssid').disabled = true;		
		document.getElementById('passwd').disabled = true;
		document.getElementById('ssid-line').style.display = 'none';
		break;
	}
}

function send_wifi() {

	var addr = document.getElementById('ap-option').value;
	if (document.getElementById('ssid').value.length != 0) { addr = '"' + document.getElementById('ssid').value + '"'; }
	if (document.getElementById('passwd').value.length == 0) { var passwd = ''; } 
	else { var passwd = '"' + document.getElementById('passwd').value + '"'; }
	var enc = document.getElementById('enctype').value;
	var nic = document.getElementById('nic').value;
//	alert(addr + passwd + enc);
	system('/usr/local/bin/get_wifi ' + nic + ' ' + enc + ' ' + addr + ' ' + passwd);

}
function select_tab( this_tab ) {
	if( this_tab.className == '' ) {
		var tabs = document.getElementById('panel').getElementsByTagName('div');
		for( var i = 0; i < tabs.length; i++ ) {
			if( tabs[i].className == 'selected' ) {
				tabs[i].className = '';
				tabs[i].getElementsByTagName('div')[0].className = '';
				break;
			}
		}
		this_tab.className = 'selected';
		this_tab.getElementsByTagName('div')[0].className = 'under_cover';
		show_menu( this_tab.id );
	}
	else if( document.getElementById('menu').className == '' )
		show_menu( this_tab.id );
}

function show_menu( input ) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath("/usr/share/plate/chrome/content/template/" + input + ".html" );

	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 

	var data = "";
	var str = sstream.read(4096);
	while (str.length > 0) {
		data += str;
		str = sstream.read(4096);
	}

	sstream.close();
	fstream.close();

	var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
    data = utf8Converter.convertURISpecToUTF8 (data, "UTF-8");
    
	document.getElementById('close_button').style.display = "none";
	document.getElementById('maximize_button').style.display = "none";
	document.getElementById('minimize_button').style.display = "none";
	document.getElementById('programs').className = '';
	document.getElementById('menu').className = 'show';
	document.getElementById('menu').innerHTML = data;
	unmaximize_program();
	do_i18n();
}

function resume_notify( this_obj, program_name ) {
	this_obj = this_obj.parentNode.getElementsByTagName('div')[0];
	if( document.getElementById( "exec." + program_name ) != null )
		this_obj.className = 'notify_resume';
	else
		this_obj.className = 'notify_hide';
}

function show_program( input ) {
	document.getElementById('close_button').style.display = "inline";
	document.getElementById('maximize_button').style.display = "inline";
	document.getElementById('minimize_button').style.display = "inline";
	document.getElementById('menu').className = '';
	document.getElementById('programs').className = 'show';
	if( document.getElementById("exec." + input) == null ) {
		var new_element = document.createElement("div");
		new_element.id = "exec."+input;
		new_element.innerHTML = "<embed src=chrome://plate/content/utils/"+input+" width=100% height=100% />";
		document.getElementById('programs').appendChild(new_element);
	}
	var programs = document.getElementById('programs').getElementsByTagName('div');
	for( var i = 0; i < programs.length; i++ )
		if( programs[i].className == 'show' ) {
			programs[i].className = '';
			break;
		}
	document.getElementById("exec."+input).className = 'show';
}

function close_program() {
	var programs = document.getElementById('programs').getElementsByTagName('div');
	for( var i = 0; i < programs.length; i++ )
		if( programs[i].className == 'show' )
			document.getElementById('programs').removeChild(programs[i]);
	var tabs = document.getElementById('panel').getElementsByTagName('div');
	for( var i = 0; i < tabs.length; i++ )
		if( tabs[i].className == "selected" )
			show_menu( tabs[i].id );
	unmaximize_program();
}

function maximize_program() {
	document.getElementById('panel').className = 'maximized';
	document.getElementById('content').className = 'maximized';
	document.getElementById('padding').className = 'maximized';
	document.getElementById('programs').className = 'maximized';
	document.getElementById('systray').style.display = 'block';
}

function unmaximize_program() {
	document.getElementById('panel').className = '';
	document.getElementById('content').className = '';
	document.getElementById('padding').className = '';
	document.getElementById('programs').className = '';
	document.getElementById('systray').style.display = 'none';
}

function toggle_maximize_program() {
	if( document.getElementById('panel').className == 'maximized' )
	{
		unmaximize_program();
		document.getElementById('programs').className = 'show';
	}
	else
		maximize_program();
}

function system(input) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath("/usr/local/bin/jswrapper");
	var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
	process.init(file);
	var args = [input];
	process.run(false, args, 1);
}

function update() {

	sleep(50);

	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath("/tmp/jswrapper.log");

	var data = "";
	document.getElementById('info').innerHTML = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 

	var str = sstream.read(4096);
	while (str.length > 0) {
		data += str;
		str = sstream.read(4096);
	}

	sstream.close();
	fstream.close();

	document.getElementById('info').innerHTML = data;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) break;
	}
}

function confirm_off() {
	tmp = window.confirm('Do you want to shutdown?'); 
	if (tmp) system('poweroff -f');
}

function update_div(id, path) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);

	var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 

	var str = sstream.read(4096);
	while (str.length > 0) {
		data += str;
		str = sstream.read(4096);
	}

	sstream.close();
	fstream.close();

	var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
    data = utf8Converter.convertURISpecToUTF8 (data, "UTF-8");

	document.getElementById(id).innerHTML = data;
}

function update_div_ife(id, path) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);
	// check if file exists
	var i=30; // timeout for 15s
	while ( file.exists() == false && i>0)
	{
		sleep(500);
		i--;
	}
	
	var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 

	var str = sstream.read(4096);
	while (str.length > 0) {
		data += str;
		str = sstream.read(4096);
	}

	sstream.close();
	fstream.close();

	document.getElementById(id).innerHTML = data;
}

function update_sysinfo() {

if (document.getElementById('sysinfo')) {
update_div('sysinfo', '/tmp/sysinfo');
}

update_div('systray', '/tmp/sysinfo-s');

system('/usr/local/bin/sysinfo');
setTimeout('update_sysinfo()', 3500);
}

var vis=1;
function cover() {

	if(vis) {
		vis=0;
		document.getElementById('cover').style.display='block';
		document.getElementById('popup').style.display='block';
	}
	else {  
		vis=1;
		document.getElementById('cover').style.display='none';
		document.getElementById('popup').style.display='none';
	}
}

function popup(path) {
cover(); 
update_div('popup', '/usr/share/plate/chrome/content/template/'+path+'.html');
do_i18n();
var w = Math.ceil((window.innerWidth - document.getElementById('popup').offsetWidth) / 2);
var h = Math.ceil((window.innerHeight - document.getElementById('popup').offsetHeight) / 2);
document.getElementById('popup').style.left=w+'px';
document.getElementById('popup').style.top=h+'px';
}

function do_i18n() {
	var lang = xpudPrefs.getCharPref("xpud.locale");
	$(".i18n").each(
	   		function(i){
	   			if(typeof i18n[$(this).text()][lang]  == "undefined")
	   				$(this).replaceWith(i18n[$(this).text()]["en"]);
	   			else
	   				$(this).replaceWith(i18n[$(this).text()][lang]);
	   			}
	);	   		         
}    

function save_preferences() {
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                               .getService(Components.interfaces.nsIPrefService);
	prefService.savePrefFile(null);
}

function setSelectedOpts(PrefString, ElementName) {
	var selVal = xpudPrefs.getCharPref(PrefString);
	var inputs = document.getElementsByName(ElementName); 
	for(var i=0; i < inputs[0].options.length; i++) {      
        if(inputs[0].options[i].value == selVal ) {
                inputs[0].options[i].selected = true;
          }      
     }
}
