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
	+"<button id='leggTilArkivpakkeNavigering'>Legg til ny arkivpakke</button>"
	loginLeft.insertAdjacentHTML('afterbegin',loginLeftHTML);
	document.getElementById("leggTilArkivpakkeNavigering").addEventListener("click",settInnLeggTilArkivpakke);
	document.getElementById("arkivpakkeSøkNavigering").addEventListener("click",settInnArkivpakkeSøk);
}

function settInnArkivpakkeLogg(){
	var parentNode = this.parentNode;
	var arkivpakkeID = parentNode.getAttribute('data');
	httpPost(function(){
		var data = JSON.parse(this.response);
		if (data.length==0) {
			document.getElementById("sokResultat").innerHTML = "Arkivpakke med id "+arkivpakkeID+" har ingen logg";
		} else {
			tømInnhold();
			//slettNode(document.getElementById("arkivpakkeTabell"));
			var html = "<table id='arkivpakkeLoggTabell'><tbody><tr>"
			+"<th>Sist endret</th>"
			+"<th>Arkivskaper</th>"
			+"<th>Ansvarlig</th>"
			+"<th>Status</th>"
			+"<th>Start dato</th>"
			+"<th>Slutt dato</th>"
			+"<th>Endret av</th>"
			+"<th>Fil</th>"
			+"</tr>";
			var arkivskaper = "";
			var ansvarlig = "";
			var statusTekst = "";
			var startDato = "";
			var sluttDato = "";
			var endretAv = "";
			var dokfil = "";
			
			for (var i = 0; i < data.length; i++) {
				html +="<tr>";
				var tempObj = data[i];
				
				html += "<td class='arkivpakkeLoggTabellSamling'>"+tempObj.sistEndret+"</td>";

				html += loggSammenligning(arkivskaper,tempObj.arkivskaper);
				arkivskaper = tempObj.arkivskaper;

				html += loggSammenligning(ansvarlig,tempObj.ansvarlig);
				ansvarlig = tempObj.ansvarlig;

				html += loggSammenligning(statusTekst,tempObj.statusTekst);
				statusTekst = tempObj.statusTekst;

				html += loggSammenligning(startDato,tempObj.startDato);
				startDato = tempObj.startDato;

				html += loggSammenligning(sluttDato,tempObj.sluttDato);
				sluttDato = tempObj.sluttDato;
				
				html += loggSammenligning(endretAv,tempObj.endretAv);
				endretAv = tempObj.endretAv;

				if (dokfil==tempObj.dokfil) {
					html += "<td></td>";
				} else {
					html += "<td class='arkivpakkeLoggTabellSamling'>"+tempObj.dokfil+"</td>";
				}
				dokfil = tempObj.dokfil;
				
				html +="</tr>"

				
			}
			html += "</tbody></table>";
			document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
		}
	},"php/arkivpakkeLogg.php","arkivID="+arkivpakkeID );
}

function settInnArkivpakkeEndring(){
	var parentNode = this.parentNode;
	var arkivpakkeID = parentNode.getAttribute('data');
	var children = parentNode.childNodes;
	var selected = children[2].innerHTML;
	//Setter inn arkivpakkeID på alle element id'er slik at de blir unike og flere kan endres samtidig.
	httpPost(function(){
		slettNode(document.getElementById("endreArkivpakkeRow"+arkivpakkeID));
		var options = "";
		var data = JSON.parse(this.response);
		for (var key in data) {
			if (data[key].statusTekst == selected) {
				options += "<option selected>"+data[key].statusTekst+"</option>";
			} else {
				options += "<option>"+data[key].statusTekst+"</option>";
			}
			
		}
		var html = "<tr data='"+arkivpakkeID+"' id='endreArkivpakkeRow"+arkivpakkeID+"' class='endreArkivpakkeRow'>"
		+"<td>Endre arkivpakke</td>"
		+"<td><input type='text' id='endreArkivpakkeAnsvarlig"+arkivpakkeID+"' value='"+children[1].innerHTML+"'></td>"
		+"<td><select id='endreArkivpakkeStatusSelect"+arkivpakkeID+"'>"+options+"</select></td>"
		+"<td>"+children[3].innerHTML+"</td>"
		+"<td><input type='text' id='endreArkivpakkeSluttDato"+arkivpakkeID+"' value='"+children[4].innerHTML+"'></td>"
		+"<td colspan='3'><input type='file' id='endreArkivpakkeFil"+arkivpakkeID+"'></td>"
		+"<td colspan='1' ><button id='endreArkivpakkeBekreft"+arkivpakkeID+"'>Bekreft</button></td>"
		+"<td colspan='1' ><button id='endreArkivpakkeAvbryt"+arkivpakkeID+"'>Avbryt</button></td>"
		+"</tr>";
		parentNode.insertAdjacentHTML('afterend',html);
		document.getElementById("endreArkivpakkeAvbryt"+arkivpakkeID).addEventListener("click",function(){
			slettNode(document.getElementById("endreArkivpakkeRow"+arkivpakkeID));
		});
		document.getElementById("endreArkivpakkeBekreft"+arkivpakkeID).addEventListener("click",sendArkivpakkeEndring);
	},"php/leggTilArkivpakke.php","statustype=statustype");
}
function sendArkivpakkeEndring(){
	var parentNode = this.parentNode.parentNode;
	var arkivpakkeID = parentNode.getAttribute('data');
	var filInput = document.getElementById("endreArkivpakkeFil"+arkivpakkeID);
	var fil = filInput.files[0];
	var ansvarligInput = document.getElementById("endreArkivpakkeAnsvarlig"+arkivpakkeID);
	var statusTekstSelect = document.getElementById("endreArkivpakkeStatusSelect"+arkivpakkeID);
	var statusTekst = statusTekstSelect[statusTekstSelect.selectedIndex].value;
	var sluttDatoInput = document.getElementById("endreArkivpakkeSluttDato"+arkivpakkeID);
	httpPost(function(){
		//Resetter validity
		ansvarligInput.setCustomValidity("");
		//startDatoInput.setCustomValidity("");
		sluttDatoInput.setCustomValidity("");
		//Regex som matcher 4 tall - 1 eller 2 tall - 1 eller 2 tall
		var regex = /\d{4}-\d{1,2}-\d{1,2}/;  

		//I stedet for regex som sjekker etter skuddår gjøres string om til dato
		//Date.parse returnerer NaN hvis ugyldig
		//var startDato = Date.parse(regex.exec(startDatoInput.value));
		var sluttDato = Date.parse(regex.exec(sluttDatoInput.value));

		//Må visst bruke formData for å sende fil uten en HTML form
		var formData = new FormData();
		formData.append("ansvarlig", ansvarligInput.value);
		//formData.append("startDato", startDatoInput.value); 
		formData.append("arkivID",arkivpakkeID);
		formData.append("sluttDato", sluttDatoInput.value);
		formData.append("statusTekst", statusTekst); 
		formData.append("fil", fil);

		//Sjekker om kommune og datoer er gyldige
		if (JSON.parse(this.response).length>0 /*&& !isNaN(startDato) */&& !isNaN(sluttDato)) {
			slettNode(document.getElementById("endreArkivpakkeRow"+arkivpakkeID));
			httpPost(function(){
				if (JSON.parse(this.response)==0){
					document.getElementById("sokResultat").innerHTML = "Arkivpakke endring ble mislykket";
				} else {
					var oppdatertArkivpakke = JSON.parse(this.response);
					var nyArkivpakkeTabellRadNode = arkivpakkeTabellRad(oppdatertArkivpakke[0]);
					nyArkivpakkeTabellRadNode.className = "arkivpakkeRadEndret";
					var tbody = document.getElementById("arkivpakkeTabellBody");
					var gammelArkivpakkeTabellRadNode = document.getElementById("arkivpakkeRad"+arkivpakkeID);
					tbody.replaceChild(nyArkivpakkeTabellRadNode,gammelArkivpakkeTabellRadNode);
					document.getElementById("sokResultat").innerHTML = "Arkivpakke med id "+arkivpakkeID+" har blitt endret";
					//slettNode(parentNode);
				}
			},"php/endreArkivpakke.php",formData,true);
		};
		if (JSON.parse(this.response)==0) {
			ansvarligInput.setCustomValidity("Ugyldig bruker");
		}
		/*if (isNaN(startDato) || !regex.exec(startDatoInput.value)) {
			startDatoInput.setCustomValidity("Ugyldig dato");
		}*/
		if (isNaN(sluttDato) || !regex.exec(sluttDatoInput.value)) {
			sluttDatoInput.setCustomValidity("Ugyldig dato");
		}
		if (fil && fil.size>1000000) {
			filInput.setCustomValidity("Fil for stor");
		}
	},"php/endreArkivpakke.php","validering=validering&ansvarlig="+ansvarligInput.value);
}

function settInnArkivpakkeOversikt(){
	slettNode(document.getElementById("arkivpakkeTabell"));
	var data = JSON.parse(this.response);

	//Setter inn en tom tabell med tittel for nesten hver kolonne
	var html = "<table id='arkivpakkeTabell'><tbody id='arkivpakkeTabellBody'><tr><th>Arkivskaper</th><th>Ansvarlig</th><th>Status</th>"
	+"<th>Start dato</th><th>Slutt dato</th><th>Sist endret</th></tr></tbody></table>"
	document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
	var arkivpakkeTabellBodyNode = document.getElementById("arkivpakkeTabellBody");

	//For hver key i data objektet lages en tr element ferdig utfylt som settes inn i tabellen
	for (var key in data) {
		arkivpakkeTabellBody.appendChild(arkivpakkeTabellRad(data[key]));
	}
}

//Lager ett ferdig rad element som settes inn i tabell, brukes i arkivoversikt og arkivendring
function arkivpakkeTabellRad(arkivpakkeObjekt){
	var rad = document.createElement("tr");
	rad.setAttribute("data",arkivpakkeObjekt.arkivID);
	rad.id = "arkivpakkeRad"+arkivpakkeObjekt.arkivID;

	//Lager td elementer med data fra de 6 første verdiene i objektet
	var keys = Object.keys(arkivpakkeObjekt);
	for (var i = 0; i < 6; i++) {
		var tempTD = document.createElement("td");
		tempTD.innerHTML = arkivpakkeObjekt[keys[i]];
		rad.appendChild(tempTD);
	}
	
	//td element med anchor som linker til nedlastning av arkivpakkefil
	var filLink = document.createElement("a");
	filLink.setAttribute("href","/php/hentFil.php?arkivID="+arkivpakkeObjekt.arkivID);
	filLink.innerHTML = "Fil";
	var filTD = document.createElement("td");
	filTD.appendChild(filLink);
	rad.appendChild(filTD);

	var loggTD = document.createElement("td");
	loggTD.className = "logg";
	loggTD.innerHTML = "Logg";
	loggTD.addEventListener("click",settInnArkivpakkeLogg);
	rad.appendChild(loggTD);

	var endreTD = document.createElement("td");
	endreTD.className = "endre";
	endreTD.innerHTML = "Endre";
	endreTD.addEventListener("click",settInnArkivpakkeEndring);
	rad.appendChild(endreTD);

	var slettTD = document.createElement("td");
	slettTD.className = "slett";
	slettTD.innerHTML = "Slett";
	slettTD.addEventListener("click",slettArkivpakke);
	rad.appendChild(slettTD);

	return rad;
}

//Sender POST til arkivpakkeSlett.php med id fra valgt element og endrer elementet hvis raden blir slettet i databasen.
function slettArkivpakke(){
	var row = this.parentNode;
	var id = row.getAttribute("data");
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
	if (!antall || !Number.isInteger(antall)){
		antall = 10;
	}
	tømInnhold();
	httpPost(settInnArkivpakkeOversikt,"php/oversikt.php","antall="+antall);
	var html = "<p id='sokResultat'>Søk etter arkivpakke</p>"
	+"<input id='arkivpakkeSøk' type='text' placeholder='Søk i arkivpakke database'>"
	+"<button id='arkivpakkeSøkButton'>Søk</button>"
	+"<div id='antallArkivpakker'>"
	+"<p>Velg antall arkivpakker som vises</p>"
	+"<button>10</button>"
	+"<button>20</button>"
	+"<button>50</button>"
	+"</div>"
	+"<button id='slettetArkivpakker'>Vis slettet arkivpakker</button>"
	document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
	document.getElementById("arkivpakkeSøk").addEventListener("keyup", function(event){
		if (event.key === "Enter") {
			arkivpakkeSøk();
		}
	});
	var antallArkivpakkerButtons = document.querySelectorAll("#antallArkivpakker button");
	for (var i = 0; i < antallArkivpakkerButtons.length; i++) {
		antallArkivpakkerButtons[i].addEventListener("click",function(){
			settInnArkivpakkeSøk(parseInt(this.innerHTML));
		})
	}
	document.getElementById("slettetArkivpakker").addEventListener("click",function(){
		httpPost(settInnArkivpakkeOversikt,"php/oversikt.php","slettet=slettet");
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


		+"<div class='form-horizontal' id='skjema'>"
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
		+"<button id='leggTilArkivpakkeButton' class='btn btn-primary'>Lagre</div></div>"
		+"</div></div>";
		document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
		document.getElementById("leggTilArkivpakkeButton").addEventListener("click",sendInnNyArkivpakke);

	},"php/leggTilArkivpakke.php","statustype=statustype");
}

function sendInnNyArkivpakke(){
	var filInput = document.getElementById("arkivpakkeFilInput");
	var fil = filInput.files[0];
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
			httpPost(function(){
				console.log(this.response)
			},"php/leggTilArkivpakke.php",formData,true);
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
	//Hvis boolean er true så blir content-type header ikke lagt til
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

//Sender tilbake en top td element hvis objektene er like
function loggSammenligning(objekt,tempObjekt){
	if (objekt==tempObjekt) {
		return "<td></td>";
	} else {
		return "<td class='arkivpakkeLoggTabellSamling'>"+tempObjekt+"</td>";
	}
}