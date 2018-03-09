/* Funksjoner som blir mye brukt:
https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
*/


//Etter php er ferdig kjørt knyttes knappene til funksjoner
window.onload = function(){
	var endrePassordButton = document.getElementById("endrePassordButton");
	var leggTilArkivpakkeNavigering = document.getElementById("leggTilArkivpakkeNavigering");
	var arkivpakkeSøkNavigering = document.getElementById("arkivpakkeSøkNavigering");
	if (endrePassordButton && leggTilArkivpakkeNavigering && arkivpakkeSøkNavigering) {
		settInnArkivpakkeSøk();
		endrePassordButton.addEventListener("click",settInnPassordEndring);
		leggTilArkivpakkeNavigering.addEventListener("click",settInnLeggTilArkivpakke);
		arkivpakkeSøkNavigering.addEventListener("click",settInnArkivpakkeSøk);
	} else {
		settInnKommuneSøk();
	}
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
	var html = "<div class='jumbotron text-center'>"
	+"<h2>Har vi arkivert det du er ute etter?</h2>"
	+"<p>Søk kommune</p>"
	+"<div class='form-group'>"
	+"<div class='col-sm-6'>"
	+"<input id='KommuneSøkInput' type='text' class='form-control input-md' placeholder='Kommune' class='form-control' size='50'>"
	+"<button id='KommuneSøkButton' type='button' class='btn btn-default'><span class='glyphicon glyphicon-search'> SØK</span></button>"
	+"</div>"
	+"</div>"
	+"</div>";


	document.getElementById("innhold").insertAdjacentHTML('beforeend', html);
	//Gjør at enter kan brukes til å starte søket
	document.getElementById("KommuneSøkInput").addEventListener("keyup", function(event){
		if (event.key === "Enter") {
			kommuneSøk();
		}
	});
	document.getElementById("KommuneSøkButton").addEventListener("click",kommuneSøk);
}

//Setter inn logg til valgt arkivpakke
function settInnArkivpakkeLogg(){

	//Henter arkivpakke ID fra rad elementet sin data attribute
	var parentNode = this.parentNode;
	var arkivpakkeID = parentNode.getAttribute('data');

	//Sender en http post request til 'arkivpakkeLogg.php' med arkivpakke ID'en
	//Og kjører en anonym funksjon med data php filen sender tilbake
	httpPost(function(){
		var data = JSON.parse(this.response);

		//Hvis data fra php er tom oppdateres 'sokResultat' paragrafen med informasjon
		if (data.length==0) {
			document.getElementById("sokResultat").innerHTML = "Arkivpakke med id "+arkivpakkeID+" har ingen logg";
		} else {
			tømInnhold();

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

			//Definerer kolonne variabler til bruk i sammenligning 
			var arkivskaper = "";
			var ansvarlig = "";
			var statusTekst = "";
			var startDato = "";
			var sluttDato = "";
			var endretAv = "";
			var dokfil = "";
			

			//Loop som går igjennom data fra php og legger til td elementer til html variabelen
			//Hvis en kolonne ikke har blitt endret så settes det ikke inn data i td elementet
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

//Setter inn en ny rad under valgt rad som skal endres
function settInnArkivpakkeEndring(){

	//Henter arkivpakkeID fra valgt rad
	var parentNode = this.parentNode;
	var arkivpakkeID = parentNode.getAttribute('data');

	//Henter arkivpakkestatus til raden
	var children = parentNode.childNodes;
	var selected = children[2].innerHTML;

	//http post request som henter statustyper
	httpPost(function(){
		slettNode(document.getElementById("endreArkivpakkeRow"+arkivpakkeID));
		var options = "";
		var data = JSON.parse(this.response);

		//Går igjennom statustypene og setter den som allerede arkivpakken har til 'selected' i dropdown menyen
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

		//Setter inn html etter valgt rad element
		parentNode.insertAdjacentHTML('afterend',html);

		//Knytter knappen 'endreArkivpakkeAvbryt' til en eventListener som sletter denne nye endrings raden
		document.getElementById("endreArkivpakkeAvbryt"+arkivpakkeID).addEventListener("click",function(){
			slettNode(document.getElementById("endreArkivpakkeRow"+arkivpakkeID));
		});

		//Knytter knappen 'endreArkivpakkeBekreft' til en eventListener som kjører funksjonen 'sendArkivpakkeEndring'
		document.getElementById("endreArkivpakkeBekreft"+arkivpakkeID).addEventListener("click",sendArkivpakkeEndring);
	},"php/leggTilArkivpakke.php","statustype=statustype");
}

//TODO: lag funksjon som kan brukes av ny arkivpakke og arkivpakke endring, dette er en kopi med små endringer.
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
//TODO erstatte med form og php
function sendInnNyArkivpakke(){
	var filInput = document.getElementById("arkivpakkeFilInput");
	var fil = filInput.files[0];
	var kommuneInput = document.getElementById("arkivpakkeKommuneInput");
	var statusTekstSelect = document.getElementById("arkivpakkeStatusSelect")
	var statusTekst = statusTekstSelect[statusTekstSelect.selectedIndex].value;
	var startDatoInput = document.getElementById("arkivpakkeStartDatoInput");
	var sluttDatoInput = document.getElementById("arkivpakkeSluttDatoInput");
	httpPost(function(){
		var data = JSON.parse(this.response);
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
		if (fil && data.validering==1 && !isNaN(startDato) && !isNaN(sluttDato)) {
			slettNode(document.getElementById("leggTilArkivpakkeDiv"));
			httpPost(function(){
				console.log(this.response)
			},"php/leggTilArkivpakke.php",formData,true);
		};
		inputValidering(kommuneInput,data.validering==0,"Ugyldig kommune");
		inputValidering(startDatoInput,isNaN(startDato) || !regex.exec(startDatoInput.value),"Ugyldig dato");
		inputValidering(sluttDatoInput,isNaN(sluttDato) || !regex.exec(sluttDatoInput.value),"Ugyldig dato");
		inputValidering(filInput,fil!=null && fil.size>1000000,"Fil for stor");
		inputValidering(filInput,!fil,"Fil ikke valgt");
	},"php/leggTilArkivpakke.php","validering=validering&kommune="+kommuneInput.value);

}

//Tar imot data i JSON form fra php og sletter den gamle tabellen hvis den finnes, så lages en ny tabell med data og settes inn.
function settInnArkivpakkeOversikt(){
	slettNode(document.getElementById("arkivpakkeTabell"));
	slettNode(document.getElementById("antallSøkResultater"));
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
	document.getElementById("innhold").insertAdjacentHTML('beforeend',"<p id='antallSøkResultater'>viser "+data.length+" resultater</p>");
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

	//td element som kjører funksjon 'settInnArkivpakkeLogg'
	var loggTD = document.createElement("td");
	loggTD.className = "logg";
	loggTD.innerHTML = "Logg";
	loggTD.addEventListener("click",settInnArkivpakkeLogg);
	rad.appendChild(loggTD);

	//td element som kjører funksjon 'settInnArkivpakkeEndring'
	var endreTD = document.createElement("td");
	endreTD.className = "endre";
	endreTD.innerHTML = "Endre";
	endreTD.addEventListener("click",settInnArkivpakkeEndring);
	rad.appendChild(endreTD);

	//td element som kjører funksjon 'slettArkivpakke'
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
			if (parseInt(this.response)==2) {
				slettChildren(row);
				row.insertAdjacentHTML('afterbegin',"<td colspan='10'><p class='red'>Arkivpakke slettet</p></td>")
			} else {
				document.getElementById("sokResultat").innerHTML="Noe gikk galt og arkivpakke med id "+id+" ble ikke slettet";
			}
		},"php/arkivpakkeSlett.php","arkivpakkeID="+id);	
	}
}

/*
Tar verdi fra input og sender til arkivpakkeSok.php,
kjører funksjon 'settInnArkivpakkeOversikt' med resultat fra php
og oppdaterer 'sokResultat' paragraf med hva som ble søkt etter
*/
function arkivpakkeSøk(){
	var inputNode = document.getElementById("arkivpakkeSøk");
	httpPost(settInnArkivpakkeOversikt,"php/arkivpakkeSok.php","arkivpakke="+inputNode.value);
	document.getElementById("sokResultat").innerHTML="Søk: "+inputNode.value;
	inputNode.value="";
}

/*
Setter inn arkivsøk/oversikt, med antall som bestemmer hvor mange arkivpakker som vises før noe søk har skjedd
*/
function settInnArkivpakkeSøk(antall) {

	//Hvis variabel antall ikke blir spesifert eller ikke er tall, settes den til 10.
	if (!antall || !Number.isInteger(antall)){
		antall = 10;
	}
	tømInnhold();
	//Sender antall til oversikt.php og kjører 'settInnArkivpakkeOversikt' med data fra php filen
	httpPost(settInnArkivpakkeOversikt,"php/oversikt.php","antall="+antall);
	
	var html = "<p id='sokResultat'>Søk etter arkivpakke</p>"
	+"<input id='arkivpakkeSøk' type='text' placeholder='Søk i arkivpakke database'>"
	+"<button id='arkivpakkeSøkButton' class='btn btn-default'>Søk</button>"
	+"<div id='antallArkivpakker'>"
	+"<p>Velg antall arkivpakker som vises</p>"
	+"<button>10</button>"
	+"<button>20</button>"
	+"<button>50</button>"
	+"</div>"
	+"<button id='slettetArkivpakker'>Vis slettet arkivpakker</button>"
	document.getElementById("innhold").insertAdjacentHTML('beforeend',html);

	//Knytter 'arkivpakkeSøk' input til en eventListener som kjører funksjonen 'arkivpakkeSøk' når Enter trykkes
	document.getElementById("arkivpakkeSøk").addEventListener("keyup", function(event){
		if (event.key === "Enter") {
			arkivpakkeSøk();
		}
	});

	//Henter alle knappene som er children av element med 'antallArkivpakker' id.
	var antallArkivpakkerButtons = document.querySelectorAll("#antallArkivpakker button");
	
	for (var i = 0; i < antallArkivpakkerButtons.length; i++) {
		
		//Knytter knappene med eventListener som kjører denne funksjonen om igjen med nytt antall arkivpakker.
		antallArkivpakkerButtons[i].addEventListener("click",function(){
			
			//Bruker antall fra selve knappen (10,20,50)
			settInnArkivpakkeSøk(parseInt(this.innerHTML));
		})
	}

	//Knytter en funksjon som setter inn arkivpakker som har blitt slettet til knappen 'slettetArkivpakker'
	document.getElementById("slettetArkivpakker").addEventListener("click",function(){
		httpPost(settInnArkivpakkeOversikt,"php/oversikt.php","slettet=slettet");
	});

	//Når knappen trykkes på kjører funksjonen 'arkivpakkeSøk'
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
		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeFilInput'>Last opp METSFIL</label>"
		+"<div class='col-sm-3 has-error'>"
		+"<input type='file' class='form-control-file' id='arkivpakkeFilInput'>"
		+"</div>"
		+"</div>"
		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeKommuneInput'>Arkivskaper:</label>"
		+"<div class='col-sm-3' >"
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
		+"<button id='leggTilArkivpakkeButton' class='btn btn-default'>Lagre</div></div>"
		+"</div></div>";
		document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
		document.getElementById("leggTilArkivpakkeButton").addEventListener("click",sendInnNyArkivpakke);
	},"php/leggTilArkivpakke.php","statustype=statustype");
}



//Setter inn html for passord endring og legger til eventListeners slik at 'Enter' starter funksjonen 'oppdaterPassord'
function settInnPassordEndring(){
	tømInnhold();
	var html = "<input id='gammeltPassord' type=password required placeholder='Gammelt passord'>"
	+"<input id='nyttPassord' type=password required placeholder='Nytt passord'>"
	+"<button id='oppdaterPassordButton' class='btn btn-default'>Endre passord</button>";
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

}

//Sjekker først om gammelt passord er korrekt, hvis korrekt sendes oppdateres passord
function oppdaterPassord(){
	var nyttPassordInput = document.getElementById("nyttPassord");
	var gammeltPassordInput = document.getElementById("gammeltPassord");

	//Sender gammelt passord til endrePassord.php for å sjekke om det er korrekt 
	//(svar fra php er enten 1 eller 0) og endrer input sin validity
	httpPost(function(){
		var inputField = document.getElementById("gammeltPassord");
		if (parseInt(this.response)==1) {
			inputField.setCustomValidity("");
		} else {
			inputField.setCustomValidity("Matcher ikke gammelt passord");
		}
	},"php/endrePassord.php","gammeltPassord="+gammeltPassordInput.value);

	//Sjekker om input er valid
	if(gammeltPassordInput.checkValidity() && nyttPassordInput.checkValidity()){

		//Sender gammelt passord for godkjenning og det nye passordet
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
	for (var i = keys.length - 1; i > 1; i--) {
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

function inputValidering(inputNode,boolean,errorTekst){
	inputNode.setCustomValidity("");
	inputNode.parentNode.classList.remove("has-error");
	if (boolean) {
		inputNode.setCustomValidity(errorTekst);
		inputNode.parentNode.classList.add("has-error");
	}
}