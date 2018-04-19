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
	var arkivpakkeOpprettet = document.getElementById("arkivpakkeOpprettet");

	if (endrePassordButton && leggTilArkivpakkeNavigering && arkivpakkeSøkNavigering) {
		settInnArkivpakkeSøk();
		endrePassordButton.addEventListener("click",settInnPassordEndring);
		leggTilArkivpakkeNavigering.addEventListener("click",settInnLeggTilArkivpakke);
		arkivpakkeSøkNavigering.addEventListener("click",settInnArkivpakkeSøk);
		if(arkivpakkeOpprettet){
			document.getElementById("sokResultat").innerHTML=arkivpakkeOpprettet.innerHTML;
		}
	} else{
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
			document.getElementById("innhold").insertAdjacentHTML('beforeend',"<p id='arkivpakkelogg'>Arkivpakkenummer "+arkivpakkeID+" logg</p>");
			var html = "<table id='arkivpakkeLoggTabell'><tbody><tr>"
			+"<th>Sist endret</th>"
			+"<th>Arkivskaper</th>"
			+"<th>Status</th>"
			+"<th>Start dato</th>"
			+"<th>Slutt dato</th>"
			+"<th>Endret av</th>"
			+"</tr>";

			//Definerer kolonne variabler til bruk i sammenligning 
			var arkivskaper = "";
			var statusTekst = "";
			var startDato = "";
			var sluttDato = "";
			var endretAv = "";
			

			//Loop som går igjennom data fra php og legger til td elementer til html variabelen
			//Hvis en kolonne ikke har blitt endret så settes det ikke inn data i td elementet
			for (var i = 0; i < data.length; i++) {
				html +="<tr>";
				var tempObj = data[i];
				
				html += "<td class='arkivpakkeLoggTabellSamling'>"+tempObj.sistEndret+"</td>";

				if(!tempObj.arkivskaper){
					html +="<td class='arkivpakkeLoggSlettet' colspan='4'>SLETTET</td>";
				} else{	
					html += loggSammenligning(arkivskaper,tempObj.arkivskaper);
					arkivskaper = tempObj.arkivskaper;

					html += loggSammenligning(statusTekst,tempObj.statusTekst);
					statusTekst = tempObj.statusTekst;

					html += loggSammenligning(startDato,tempObj.startDato);
					startDato = tempObj.startDato;

					html += loggSammenligning(sluttDato,tempObj.sluttDato);
					sluttDato = tempObj.sluttDato;
				}
				html += loggSammenligning(endretAv,tempObj.endretAv);
				endretAv = tempObj.endretAv;
				
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

	//Henter en nodeList av alle elementer fra <tr>
	var children = parentNode.childNodes;
	

	//http post request som henter statustyper
	httpPost(function(){
		var options = "";
		var data = JSON.parse(this.response);

		//Går igjennom statustypene og setter den som allerede arkivpakken har til 'selected' i dropdown menyen
		for (var key in data) {
			if (data[key].statusTekst == children[1].innerHTML) {
				options += "<option selected>"+data[key].statusTekst+"</option>";
			} else {
				options += "<option>"+data[key].statusTekst+"</option>";
			}
		}

		var endreInput = "<td><input type='text' placeholder='"+children[0].innerHTML+"'></td>"
		+"<td><select>"+options+"</select></td>"
		+"<td><input type='text' placeholder='"+children[2].innerHTML+"'></td>"
		+"<td><input type='text' placeholder='"+children[3].innerHTML+"'></td>"
		
		+"<td colspan='1' ><button id='endreArkivpakkeBekreft"+arkivpakkeID+"'>Bekreft endring</button></td>"
		+"<td colspan='1' ><button id='endreArkivpakkeAvbryt"+arkivpakkeID+"'>Avbryt</button></td>"
		+"<td colspan='3'></td>";

		//Lager en kopi av den originale raden før sletting/innsetting
		var arr = [];
		for (var i = 0; i < children.length; i++) {
			arr.push(children[i]);
		}

		//Sletter alle de originale elementer og setter inn html av de nye
		slettChildren(parentNode);
		parentNode.insertAdjacentHTML('afterbegin',endreInput);


		//Knytter knappen 'endreArkivpakkeAvbryt' til en eventListener som sletter de nye elementene og setter inn kopien av de originale
		document.getElementById("endreArkivpakkeAvbryt"+arkivpakkeID).addEventListener("click",function(){
			slettChildren(parentNode);
			for (var i = 0; i < arr.length; i++) {
				parentNode.appendChild(arr[i]);
			}
		});

		//Knytter knappen 'endreArkivpakkeBekreft' til en eventListener som kjører funksjonen 'sendArkivpakkeEndring'
		document.getElementById("endreArkivpakkeBekreft"+arkivpakkeID).addEventListener("click",sendArkivpakkeEndring);
	},"php/leggTilArkivpakke.php","statustype=statustype");
}


//Oppdaterer valgt arkivpakke, placeholder tekst inneholder nåværende verdier til arkivpakken
function sendArkivpakkeEndring(){

	//Funksjon som sjekker om input har en verdi tekst lengre enn 0
	//og sender tilbake verdi eller placeholder tekst avhengig av resultat
	function inputTekst(inputNode){
		if (inputNode.value.length>0) {
			return inputNode.value;
		} else{
			return inputNode.getAttribute("placeholder");
		}
	}

	//Henter data fra <tr> elementet som skal sendes til endreArkivpakke.php
	var parentNode = this.parentNode.parentNode;
	var arkivpakkeID = parentNode.getAttribute('data');
	var arkivskaper = inputTekst(parentNode.childNodes[0].childNodes[0]);
	var statusTekstSelect = parentNode.childNodes[1].childNodes[0];
	var statusTekst = statusTekstSelect[statusTekstSelect.selectedIndex].value;
	var startDato = inputTekst(parentNode.childNodes[2].childNodes[0]);
	var sluttDato = inputTekst(parentNode.childNodes[3].childNodes[0]);

	//Sjekker og endrer dato input sin validity
	inputValidering(parentNode.childNodes[2].childNodes[0],gyldigDato(startDato),"Uglydig dato");
	inputValidering(parentNode.childNodes[3].childNodes[0],gyldigDato(sluttDato),"Uglydig dato");

	//Hvis begge input er gyldig sendes data til endreArkivpakke.php
	if (parentNode.childNodes[2].childNodes[0].checkValidity() && parentNode.childNodes[3].childNodes[0].checkValidity()) {

		var parameter = "arkivID="+arkivpakkeID
		+"&arkivskaper="+arkivskaper
		+"&statusTekst="+statusTekst
		+"&startDato="+startDato
		+"&sluttDato="+sluttDato;

		httpPost(function(){
			if (sjekkJSONresponse(this.response)) {
				var data = JSON.parse(this.response);
				var oppdatertRad = arkivpakkeTabellRad(data[0]);
				oppdatertRad.className = "arkivpakkeEndringOppdatert";
				var nesteRad = parentNode.nextSibling;
				slettNode(parentNode);
				nesteRad.parentNode.insertBefore(oppdatertRad, nesteRad);
				document.getElementById("sokResultat").innerHTML="Arkivpakke med ID: "+arkivpakkeID+" har blitt oppdatert";
			} else {
				document.getElementById("sokResultat").innerHTML="Arkivpakke ble ikke oppdatert "+this.response;
			}

		},"php/endreArkivpakke.php",parameter);
	}
}

//Sjekker om dato og kommune er gyldig og endrer validity slik at form ikke blir sendt hvis ugyldig
function nyArkivpakkeValidering(){
	var filInput = document.getElementById("arkivpakkeFilInput");
	var fil = filInput.files[0];
	var kommuneInput = document.getElementById("arkivpakkeKommuneInput");
	var startDatoInput = document.getElementById("arkivpakkeStartDatoInput");
	var sluttDatoInput = document.getElementById("arkivpakkeSluttDatoInput");

	inputValidering(filInput,fil.size<1000000,"Fil for stor");
	inputValidering(startDatoInput,gyldigDato(startDatoInput.value),"Uglydig dato");
	inputValidering(sluttDatoInput,gyldigDato(sluttDatoInput.value),"Uglydig dato");

	httpPost(function(){
		inputValidering(kommuneInput,JSON.parse(this.response).validering==1,"Kommune finnes ikke");
	},"php/leggTilArkivpakke.php","validering=validering&kommune="+kommuneInput.value);

}

//Tar imot data i JSON form fra php og sletter den gamle tabellen hvis den finnes, så lages en ny tabell med data og settes inn.
function settInnArkivpakkeOversikt(){
	slettNode(document.getElementById("arkivpakkeTabell"));
	slettNode(document.getElementById("antallSøkResultater"));
	var data = JSON.parse(this.response);

	//Setter inn en tom tabell med tittel for nesten hver kolonne
	var html = "<table id='arkivpakkeTabell'><tbody id='arkivpakkeTabellBody'><tr><th>Arkivskaper</th><th>Status</th>"
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
	//console.log(arkivpakkeObjekt);
	var rad = document.createElement("tr");
	rad.setAttribute("data",arkivpakkeObjekt.arkivID);
	rad.id = "arkivpakkeRad"+arkivpakkeObjekt.arkivID;

	//Lager td elementer med data fra de 6 første verdiene i objektet
	var keys = Object.keys(arkivpakkeObjekt);
	for (var i = 0; i < 5; i++) {
		var tempTD = document.createElement("td");
		tempTD.innerHTML = arkivpakkeObjekt[keys[i]];
		rad.appendChild(tempTD);
	}
	
	//td element med anchor som linker til nedlastning av arkivpakkefil
	var filLink = document.createElement("a");
	filLink.setAttribute("href","/v18gr6/php/hentFil.php?arkivID="+arkivpakkeObjekt.arkivID);
	filLink.innerHTML = arkivpakkeObjekt.filnavn+"-"+Math.ceil(arkivpakkeObjekt.filstørrelse)+"kB";
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
			if (parseInt(this.response)==1) {
				slettChildren(row);
				row.insertAdjacentHTML('afterbegin',"<td colspan='10'><p class='red'>Arkivpakke slettet</p></td>")
			} else {
				document.getElementById("sokResultat").innerHTML=this.response;
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
	
	var html = "<div class='jumbotron text-center'>"
	+"<h2>Søk etter arkivpakke:</h2>"
	+"<div class='form-group'>"
	+"<div class='col-sm-6'>"
	+"<input id='arkivpakkeSøk' type='text' placeholder='Søk i arkivpakke database'>"
	+"<button id='arkivpakkeSøkButton' class='btn btn-default'><span class='glyphicon glyphicon-search'> SØK</span></button>"
	+"</div>"
	+"</div>"
	+"</div>"
	+"<div id='antallArkivpakker'>"
	+"<p>Velg antall arkivpakker som vises:</p>"
	+"<button class='btn btn-default'>10</button>"
	+"<button class='btn btn-default'>20</button>"
	+"<button class='btn btn-default'>50</button>"
	+"<button id='slettetArkivpakker' class='btn btn-default'>Vis slettet arkivpakker</button>"
	+"</div>"
	+"<p id='sokResultat'></p>"
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
		httpPost(function(){

			var data = JSON.parse(this.response);
			var table = document.createElement("table");
			var theader = document.createElement("th");
			theader.innerHTML="Arkivpakker som har blitt slettet";
			theader.setAttribute("colspan","2");
			table.appendChild(theader);
			table.id = "arkivpakketabell";
			table.className = "slettetArkivpakker";
			for (var i = 0; i < data.length; i++) {
				var rad = document.createElement("tr");
				rad.setAttribute("data",data[i].arkivID);
				var loggTD = document.createElement("td");
				loggTD.className = "logg";
				loggTD.innerHTML = "Logg";
				loggTD.addEventListener("click",settInnArkivpakkeLogg);
				var arkivID = document.createElement("td");
				arkivID.innerHTML = "Arkivpakke nummer: "+data[i].arkivID;
				rad.appendChild(arkivID);
				rad.appendChild(loggTD);
				table.appendChild(rad);
			}

			slettNode(document.getElementById("arkivpakkeTabell"));
			slettNode(document.getElementById("antallSøkResultater"));

			document.getElementById("innhold").appendChild(table);

		},"php/oversikt.php","slettet=slettet");
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

		+"<form class='form-horizontal' id='skjema' method='post' enctype='multipart/form-data'>"
		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeFilInput'>Last opp METSFIL</label>"
		+"<div class='col-sm-3 has-error'>"
		+"<input name='fil' type='file' required class='form-control-file' id='arkivpakkeFilInput'>"
		+"</div>"
		+"</div>"
		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeKommuneInput'>Arkivskaper:</label>"
		+"<div class='col-sm-3' >"
		+"<input name=kommune type='text' class='form-control' id='arkivpakkeKommuneInput' placeholder='Kommune'></div></div>"
		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeStatusSelect'>Status:</label>"
		+"<div class='col-sm-3'>"
		+"<select name=statusTekst class='form-control' id='arkivpakkeStatusSelect'>"+options+"</select>"
		+"</div></div>"

		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeStartDatoInput'>Gyldig startdato: åååå-mm-dd</label>"
		+"<div class='col-sm-3'>"
		+"<input name='startDato' type='text' class='form-control' id='arkivpakkeStartDatoInput' placeholder='Start dato'></div></div>"
		+"<div class='form-group'>"
		+"<label class='control-label col-sm-3' for='arkivpakkeSluttDatoInput'>Gyldig sluttdato: åååå-mm-dd</label>"
		+"<div class='col-sm-3'>"
		+"<input name='sluttDato' type='text' class='form-control' id='arkivpakkeSluttDatoInput' placeholder='Slutt dato'></div></div>"
		+"<div class='form-group'>"       
		+"<div class='col-sm-offset-2 col-sm-3'>"
		+"<button id='leggTilArkivpakkeButton' class='btn btn-default'>Lagre</div></div>"
		+"</div></form>";
		document.getElementById("innhold").insertAdjacentHTML('beforeend',html);
		document.getElementById("leggTilArkivpakkeButton").addEventListener("click",nyArkivpakkeValidering);
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

//Sjekker først om gammelt passord er korrekt, hvis korrekt sendes det nye passordet
function oppdaterPassord(){
	var nyttPassordInput = document.getElementById("nyttPassord");
	var gammeltPassordInput = document.getElementById("gammeltPassord");

	//Sender gammelt passord til endrePassord.php for å sjekke om det er korrekt 
	httpPost(function(){
		var inputField = document.getElementById("gammeltPassord");

		//Endrer gammelt passord validity avhengig av response fra endrePassord.php
		inputValidering(inputField,parseInt(this.response)==1,"Matcher ikke gammelt passord");

		//Sletter error beskjed hvis den finnes
		slettNode(document.querySelector(".red"));

		//Hvis response fra endrePassord.php ikke er 1 så er gammelt passord feil
		if (!parseInt(this.response)==1) {
			document.getElementById("innhold").insertAdjacentHTML('beforeend',"<p class='red'>Gammelt passord er feil</p>");
		}

		//Sjekker om input er valid
		if(gammeltPassordInput.checkValidity() && nyttPassordInput.checkValidity()){

			//Sender gammelt og nytt passord til endrePassord.php
			httpPost(function(){
				if (parseInt(this.response)==1){
					tømInnhold();
					document.getElementById("innhold").insertAdjacentHTML('beforeend',"<p class='green'>Passord har blitt endret</p>");
				} else {
					document.getElementById("innhold").insertAdjacentHTML('beforeend',"<p class='red'>Server feil, prøv igjen senere</p>");
				}
			},"php/endrePassord.php","nyttPassord="+nyttPassordInput.value+"&gammeltPassord="+gammeltPassordInput.value);

		}
	},"php/endrePassord.php","gammeltPassord="+gammeltPassordInput.value);
}


//Sender POST spørring med paramter til URL. Med en eventlistener som kjører på 'load', altså hvis man får en respons
function httpPost(funksjon,url,parameter){
	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.addEventListener("load", funksjon);
	xmlHttpRequest.open("POST", url);
	xmlHttpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttpRequest.send(parameter);
}

//Sletter alle children til valgt node
function slettChildren(node){
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
}

//Sjekker om inndata er gyldig JSON
function sjekkJSONresponse(json) {
	try {
		JSON.parse(json);
	} catch (SyntaxError) {
		return false;
	}
	return true;
}

//Fjerner alle nodes fra 'innhold' utenom den første som skal være 'login'
function tømInnhold(){
	var list = document.getElementById("innhold").childNodes;
	var keys = Object.keys(list);
	for (var i = keys.length - 1; i > 1; i--) {
		slettNode(list[keys[i]]);
	}
}

//Sletter valgt node hvis den finnes
function slettNode(node){
	if(node){
		node.parentNode.removeChild(node);
	}
}

//Sender tilbake en top td element hvis objektene er like
function loggSammenligning(objekt,tempObjekt){
	if (objekt==tempObjekt) {
		return "<td></td>";
	} else {
		return "<td class='arkivpakkeLoggTabellSamling'>"+tempObjekt+"</td>";
	}
}

//Endrer på validity til valgt input med valgt tekst
function inputValidering(inputNode,boolean,errorTekst){
	inputNode.setCustomValidity("");
	inputNode.parentNode.classList.remove("has-error");
	if (!boolean) {
		inputNode.setCustomValidity(errorTekst);
		inputNode.parentNode.classList.add("has-error");
	}
}

//Bruker regex til å sjekke at verdien er korrekt satt opp, og Date.parse til å sjekke at verdien er en dato.
function gyldigDato(datoVerdi){
	var regex = /\d{4}-\d{1,2}-\d{1,2}/;  
	var dato = Date.parse(regex.exec(datoVerdi));
	return !isNaN(dato);
}