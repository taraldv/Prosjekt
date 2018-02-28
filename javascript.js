/* Funksjoner som blir mye brukt:
https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
*/
lesURL();

//Funksjon som først sjekker om bruker har mislykket en inlogging.
//Så sjekkes om bruker inlogget og skal se autorisert navigering eller vanlig index.
function lesURL(){
	slettNode(document.getElementById("javascript"));

	//Mislykket inlogging har ?error i url og denne try blokken fungerer.
	try{
		var urlQuery = document.URL.split("?")[1];
		if(urlQuery.indexOf("error")>=0){
			document.getElementById("loginLeft").insertAdjacentHTML('beforeend',"<p class='red'>Feil passord eller brukernavn</p>");
			settInnInnlogging();
			settInnKommuneSøk();

			//Endrer url slik at bruker ikke ser ?error
			window.history.pushState("", "", "index.html");
		}

	//Hvis try blokken ikke fungerer så sjekkes det om bruker har en session eller ikke
} catch (TypeError){
		//Sender en POST uten parameter til sessionSjekk.php
		httpPost(function(){
			//Responsen fra php er brukernavn: $brukernavn i JSON format hvis session eksisterer.
			if (this.response.length>0) {
				var data = JSON.parse(this.response);
				var fornavn = storBokstav(data.fornavn);
				var etternavn = storBokstav(data.etternavn);

				settInnAutentisertNavigering(fornavn,etternavn);
				settInnArkivpakkeSøk();
			} else {
				settInnInnlogging();
				settInnKommuneSøk();
			}
		},"php/sessionSjekk.php","");
	}
}

//Setter inn inlogging form i 'loginRight' div
function settInnInnlogging(){
	var html = "<form action='php/inlogging.php' method='POST'>"
	+"<input id='brukernavn' type='text' name='brukernavn' placeholder='Brukernavn' required>"
	+"<input id='passord' type='password' name='passord' placeholder='Passord' required>"
	+"<button type='submit'>Logg inn</button></form></div>";
	document.getElementById("loginRight").insertAdjacentHTML('afterbegin', html);
}

//Sender POST til kommuneSok.php med tekst fra 'KommuneSøkInput' input og
//setter inn resultatet i en tabell i 'innhold' div
function kommuneSøk(){
	var tekst = document.getElementById("KommuneSøkInput").value;
	slettNode(document.getElementById("kommuneSøkResultat"));
	httpPost(function(){
		var antallDeponeringer = JSON.parse(this.response)[tekst];
		var html = "<table id='kommuneSøkResultat'><tr><th>Kommune</th><th>Antall Deponeringer</th></tr>"
		+"<tr><td>"+tekst+"</td><td>"+antallDeponeringer+"</td></tr></table>";
		document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
	},"php/kommuneSok.php","kommune="+tekst);
}

//Legger inn input og knapp som starter søket i 'innhold' div
function settInnKommuneSøk(){
	tømInnhold();
	var html = "<p>Søk etter antall deponeringer i en kommune</p>"
	+ "<input id='KommuneSøkInput' type='text' placeholder='Kommunenavn'>"
	+ "<button id='KommuneSøkButton'>Søk</button>";
	document.getElementById("innhold").insertAdjacentHTML('beforeend', html);
	//Gjør at enter kan brukes til å starte søket
	document.getElementById("KommuneSøkInput").addEventListener("keyup", function(event){
		if (event.key === "Enter") {
			kommuneSøk();
		}
	});
	document.getElementById("KommuneSøkButton").addEventListener("click",kommuneSøk);
}

//Legger inn navigering til en bruker som har logget inn
function settInnAutentisertNavigering(fornavn,etternavn){
	var loginRight = document.getElementById("loginRight");
	var loginLeft = document.getElementById("loginLeft");

	var loginRightHTML = "<p>"+fornavn+" "+etternavn+"</p>"
	+"<button id='endrePassordButton' type='button'>Endre passord</button>"
	+"<form action='php/utlogging.php' method='POST'>"
	+ "<button type='submit'>Logg ut</button>"
	+ "</form>";
	loginRight.insertAdjacentHTML('afterbegin', loginRightHTML);
	document.getElementById("endrePassordButton").addEventListener("click",settInnPassordEndring);

	var loginLeftHTML = "<button id='arkivpakkeSøkNavigering'>Søk i arkivpakker</button>"
	+"<button id='kommuneSøkNavigering'>Søk i kommuner</button>"
	+"<button id='leggTilArkivpakkeNavigering'>Legg til ny arkivpakke</button>"
	loginLeft.insertAdjacentHTML('afterbegin',loginLeftHTML);
	document.getElementById("leggTilArkivpakkeNavigering").addEventListener("click",settInnLeggTilArkivpakke);
	document.getElementById("kommuneSøkNavigering").addEventListener("click",settInnKommuneSøk);
	document.getElementById("arkivpakkeSøkNavigering").addEventListener("click",settInnArkivpakkeSøk);
}

function settInnArkivpakkeOversikt(){
	slettNode(document.getElementById("arkivpakkeTabell"));
	var data = JSON.parse(this.response);
	var html = "<table id='arkivpakkeTabell'><tr><th>Arkivskaper</th><th>Ansvarlig</th><th>Status</th>"
	+"<th>Start dato</th><th>Slutt dato</th><th>Sist endret</th></tr>"
	for (var key in data) {
		html+="<tr><td>"+data[key].kommuneNavn+"</td>"
		+"<td>"+data[key].brukerNavn+"</td>"
		+"<td>"+data[key].statusTekst+"</td>"
		+"<td>"+data[key].startDato+"</td>"
		+"<td>"+data[key].sluttDato+"</td>"
		+"<td>"+data[key].sistEndret+"</td>"
		+"<td><a href='/php/hentFil.php?arkivID="+data[key].arkivID+"'>Fil</a></td>"
		+"<td data='"+data[key].arkivID+"' class='logg'>Logg</td>"
		+"<td data='"+data[key].arkivID+"' class='endre'>Endre</td>"
		+"<td data='"+data[key].arkivID+"' class='slett'>Slett</td></tr>";
	}
	document.getElementById("innhold").insertAdjacentHTML('beforeend',html+="</table>");
	var loggNodes = document.getElementsByClassName("logg");
	var endreNodes = document.getElementsByClassName("endre");
	var slettNodes = document.getElementsByClassName("slett");
	//if (loggNodes.length == endreNodes.length && loggNodes.length == slettNodes.length && loggNodes) {
		for(x=0;x<loggNodes.length;x++){
			//loggNodes[x].addEventListener("click",slettArkivpakke);
			//endreNodes[x].addEventListener("click",slettArkivpakke);
			slettNodes[x].addEventListener("click",slettArkivpakke);
		}
	//}

}

//Sender POST til arkivpakkeSlett.php med id fra valgt element og endrer elementet hvis raden blir slettet i databasen.
function slettArkivpakke(){
	var id = this.getAttribute("data");
	var row = this.parentNode;
	if (window.confirm("Er du sikker på sletting av arkivpakke?")) { 
		httpPost(function(){
			if (parseInt(this.response)==1) {
				slettChildren(row);
				row.insertAdjacentHTML('afterbegin',"<td colspan='10'><p class='red'>Arkivpakke slettet</p></td>")
			} else {
				//Kode hvis arkivpakke ikke ble slettet (php/sql error)
			}
		},"php/arkivpakkeSlett.php","arkivpakkeID="+id);	
	}
}

function arkivpakkeSøk(){
	var inputNode = document.getElementById("arkivpakkeSøk");
	httpPost(settInnArkivpakkeOversikt,"php/arkivpakkeSok.php","arkivpakke="+inputNode.value);
	document.getElementById("sokResultat").innerHTML="Søk: "+inputNode.value;
	inputNode.value="";
}

function settInnArkivpakkeSøk(antall) {
	if (!antall || !Number.isInteger(antall)) {
		antall = 10;
	}
	tømInnhold();
	httpPost(settInnArkivpakkeOversikt,"php/oversikt.php","antall="+antall);
	var html = "<p id='sokResultat'>Søk etter arkivpakke</p>"
	+"<input id='arkivpakkeSøk' type='text' placeholder='Søk i arkivpakke database'>"
	+"<button id='arkivpakkeSøkButton'>Søk</button>"
	document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
	document.getElementById("arkivpakkeSøk").addEventListener("keyup", function(event){
		if (event.key === "Enter") {
			arkivpakkeSøk();
		}
	});
	document.getElementById("arkivpakkeSøkButton").addEventListener("click",arkivpakkeSøk);
}

function settInnLeggTilArkivpakke(){
	tømInnhold();
	httpPost(function(){
		var options = "";
		var data = JSON.parse(this.response);
		for (var key in data) {
			options += "<option>"+data[key].statusTekst+"</option>";
		}

		var html = "<div id='leggTilArkivpakkeDiv'><h2>Legg til ny arkivpakke</h2></br>"


		+"<div class='form-horizontal' id='skjema' action='php/leggTilArkivpakke.php' method='POST'>"
		//+"<form class='form-horizontal' id='skjema' action='php/leggTilArkivpakke.php' method='POST'>"

		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeFilInput'>Last opp METSFIL</label>"
		+"<div class='col-sm-3'>"
		+"<input type='file' id='arkivpakkeFilInput'></div></div>"

		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeKommuneInput'>Arkivskaper:</label>"
		+"<div class='col-sm-3'>"
		+"<input type='text' class='form-control' id='arkivpakkeKommuneInput' placeholder='Kommune'></div></div>"

		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeStatusSelect'>Status:</label>"
		+"<div class='col-sm-3'>"
		+"<select class='form-control' id='arkivpakkeStatusSelect'>"+options+"</select>"
		+"</div></div>"


		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeStartDatoInput'>Gyldig startdato: åååå-mm-dd</label>"
		+"<div class='col-sm-3'>"
		+"<input type='text' class='form-control' id='arkivpakkeStartDatoInput' placeholder='Start dato'></div></div>"
		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeSluttDatoInput'>Gyldig sluttdato: åååå-mm-dd</label>"
		+"<div class='col-sm-3'>"
		+"<input type='text' class='form-control' id='arkivpakkeSluttDatoInput' placeholder='Slutt dato'></div></div>"

		+"<div class='form-group'>"       
		+"<div class='col-sm-offset-2 col-sm-3'>"
		+"<button id='leggTilArkivpakkeButton' type='submit' class='btn btn-primary'>Lagre</div></div>"
		+"</div></div>";
		document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
		document.getElementById("leggTilArkivpakkeButton").addEventListener("click",sendInnNyArkivpakke);

	},"php/leggTilArkivpakke.php","statustype=statustype");
}

function sendInnNyArkivpakke(){
	var filInput = document.getElementById("arkivpakkeFilInput");
	var fil = filInput.files[0];
	console.log(fil);
	var kommuneInput = document.getElementById("arkivpakkeKommuneInput");
	var statusTekstSelect = document.getElementById("arkivpakkeStatusSelect")
	var statusTekst = statusTekstSelect[statusTekstSelect.selectedIndex].value;
	var startDatoInput = document.getElementById("arkivpakkeStartDatoInput");
	var sluttDatoInput = document.getElementById("arkivpakkeSluttDatoInput");
	httpPost(function(){
		//Resetter validity
		kommuneInput.setCustomValidity("");
		startDatoInput.setCustomValidity("");
		sluttDatoInput.setCustomValidity("");
		//Regex som matcher 4 tall - 1 eller 2 tall - 1 eller 2 tall
		var regex = /\d{4}-\d{1,2}-\d{1,2}/;  

		//I stedet for regex som sjekker etter skuddår gjøres string om til dato
		//Date.parse returnerer NaN hvis ugyldig
		var startDato = Date.parse(regex.exec(startDatoInput.value));
		var sluttDato = Date.parse(regex.exec(sluttDatoInput.value));

		//Må visst bruke formData for å sende fil uten en HTML form
		var formData = new FormData();
		formData.append("kommune", kommuneInput.value);
		formData.append("startDato", startDatoInput.value); 
		formData.append("sluttDato", sluttDatoInput.value);
		formData.append("statusTekst", statusTekst); 
		formData.append("fil", fil);

		//Sjekker om kommune og datoer er gyldige
		if (fil && JSON.parse(this.response).length>0 && !isNaN(startDato) && !isNaN(sluttDato)) {
			slettNode(document.getElementById("leggTilArkivpakkeDiv"));
			httpPost(function(){console.log(this.response)},"php/leggTilArkivpakke.php",formData,true);
		};
		if (JSON.parse(this.response)==0) {
			kommuneInput.setCustomValidity("Ugyldig kommune");
		}
		if (isNaN(startDato) || !regex.exec(startDatoInput.value)) {
			startDatoInput.setCustomValidity("Ugyldig dato");
		}
		if (isNaN(sluttDato) || !regex.exec(sluttDatoInput.value)) {
			sluttDatoInput.setCustomValidity("Ugyldig dato");
		}
		if (!fil) {
			filInput.setCustomValidity("Fil ikke valgt");
		} else if (fil.size>1000000) {
			filInput.setCustomValidity("Fil for stor");
		}
	},"php/leggTilArkivpakke.php","validering=validering&kommune="+kommuneInput.value);

}

//Setter inn html for passord endring og legger til eventListeners slik at 'Enter' starter funksjonen 'oppdaterPassord'
//'gammeltPassord' input for også en eventListener på 'focusout' som sjekker validity
function settInnPassordEndring(){
	tømInnhold();
	var html = "<input id='gammeltPassord' type=password required placeholder='Gammelt passord'>"
	+"<input id='nyttPassord' type=password required placeholder='Nytt passord'>"
	+"<button id='oppdaterPassordButton'>Endre passord</button>";
	document.getElementById("innhold").insertAdjacentHTML('beforeend', html);
	var gammeltPassord = document.getElementById("gammeltPassord");

	//Legger til eventListener slik at klikk på knapp eller 'Enter' i input oppdater passord
	document.getElementById("oppdaterPassordButton").addEventListener("click",oppdaterPassord);
	gammeltPassord.addEventListener("keyup", enterKeyListener);
	document.getElementById("nyttPassord").addEventListener("keyup", enterKeyListener);

	//Funksjon som sjekker om Enter har blitt trykket og kjører oppdaterPassord hvis ja
	function enterKeyListener(event){
		if (event.key === "Enter") {
			oppdaterPassord();
		}
	}

	//EventListener som kjører hvis input mister fokus.
	gammeltPassord.addEventListener("focusout", function(){
		//Sjekker om gammelt passord er godkjent
		endrePassordValidity(this.value);
	});

}

//Sender POST til endrePassord.php hvis begge input er valid
function oppdaterPassord(){
	var nyttPassordInput = document.getElementById("nyttPassord");
	var gammeltPassordInput = document.getElementById("gammeltPassord");
	//Sjekker om gammelt passord er godkjent
	endrePassordValidity(gammeltPassordInput.value);
	//Sjekker om input er valid
	if(gammeltPassordInput.checkValidity() && nyttPassordInput.checkValidity()){
		httpPost(function(){
			if (parseInt(this.response)==1){
				tømInnhold();
				document.getElementById("innhold").insertAdjacentHTML('beforeend',"<p class='green'>Passord har blitt endret</p>");
			} else {
				//sql error
			}
		},"php/endrePassord.php","nyttPassord="+nyttPassordInput.value+"&gammeltPassord="+gammeltPassordInput.value);
	}
}

function endrePassordValidity(passord){
	httpPost(function(){
		var inputField = document.getElementById("gammeltPassord");
		if (parseInt(this.response)==1) {
			inputField.setCustomValidity("");
		} else {
			inputField.setCustomValidity("Matcher ikke gammelt passord");
		}
	},"php/endrePassord.php","gammeltPassord="+passord);
}


//Sender POST spørring med paramter til URL. Med en eventlistener som kjører på 'load'
function httpPost(funksjon,url,parameter,boolean){
	
	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.addEventListener("load", funksjon);
	xmlHttpRequest.open("POST", url);
	if(!boolean){
		xmlHttpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	}
	xmlHttpRequest.send(parameter);
}

//Sletter alle children til valgt node
function slettChildren(node){
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
}

//Fjerner alle nodes fra 'innhold' utenom den første som skal være 'login'
function tømInnhold(){
	var list = document.getElementById("innhold").childNodes;
	var keys = Object.keys(list);
	for (var i = keys.length - 1; i > 0; i--) {
		slettNode(list[keys[i]]);
	}
}

//Sletter valgt node
function slettNode(node){
	if(node){
		node.parentNode.removeChild(node);
	}
}

//Sender tilbake ordet med første bokstav som stor
function storBokstav(ord){
	var stor = ord.charAt(0).toUpperCase();
	return stor+ord.substring(1);
}