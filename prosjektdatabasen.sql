DROP DATABASE IF EXISTS v18gr6;

CREATE DATABASE v18gr6
  CHARACTER SET utf8
  COLLATE utf8_general_ci;

USE v18gr6;

DROP TABLE IF EXISTS logg;
DROP TABLE IF EXISTS arkivpakke;
DROP TABLE IF EXISTS statustype;
DROP TABLE IF EXISTS doklager;
DROP TABLE IF EXISTS bruker;
DROP TABLE IF EXISTS kommune;


CREATE TABLE statustype (
	statusTekst VARCHAR(150),
	CONSTRAINT statusPK
	PRIMARY KEY (statusTekst)
	) engine = InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE doklager (
	filID INTEGER AUTO_INCREMENT,
	filnavn VARCHAR(150),
	filstørrelse DECIMAL(4,3),
	CONSTRAINT doklagerPK
	PRIMARY KEY (filID)
	) engine = InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE kommune (
	kommuneNr SMALLINT,
	kommunenavn VARCHAR(100) UNIQUE,
	CONSTRAINT kommunePK
	PRIMARY KEY (kommuneNr)
	) engine = InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bruker (
	brukerID INTEGER AUTO_INCREMENT,
	brukernavn VARCHAR(100) UNIQUE,
	passord VARCHAR(100),
	fornavn VARCHAR(150),
	etternavn VARCHAR(150),
	CONSTRAINT brukerPK
	PRIMARY KEY (brukerID)
	) engine = InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE arkivpakke (
	arkivID INTEGER AUTO_INCREMENT,
	arkivskaper SMALLINT NOT NULL,
	statusTekst VARCHAR(100) NOT NULL,
	startDato DATE NOT NULL,
	sluttDato DATE NOT NULL,
	sistEndret TIMESTAMP NOT NULL,
	endretAv INTEGER NOT NULL,
	dokfil INTEGER NOT NULL,
	CONSTRAINT arkivpakkePK
	PRIMARY KEY (arkivID),
	CONSTRAINT statustypeFK
	FOREIGN KEY(statusTekst) REFERENCES statustype(statusTekst),
	CONSTRAINT dokfilFK
	FOREIGN KEY(dokfil) REFERENCES doklager(filID),
	CONSTRAINT arkivskaperFK
	FOREIGN KEY(arkivskaper) REFERENCES kommune(kommuneNr),
	CONSTRAINT endretAvFK
	FOREIGN KEY(endretAv) REFERENCES bruker(brukerID)
	) engine = InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE logg (
	loggID INTEGER AUTO_INCREMENT,
	arkivID INTEGER,
	arkivskaper SMALLINT,
	statusTekst VARCHAR(100),
	startDato DATE,
	sluttDato DATE,
	sistEndret TIMESTAMP NOT NULL,
	endretAv INTEGER NOT NULL,
	slettet BOOLEAN,
	CONSTRAINT loggPK
	PRIMARY KEY (loggID)
	) engine = InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TRIGGER IF EXISTS arkivpakkeARI;
DROP TRIGGER IF EXISTS arkivpakkeARU;
DROP FUNCTION IF EXISTS kommuneEksisterer;
DROP FUNCTION IF EXISTS nyArkivpakke;
DROP PROCEDURE IF EXISTS slettArkivpakke;

DELIMITER ::

CREATE FUNCTION nyArkivpakke
(
	 p_filnavn VARCHAR(150),
	 p_filStr DECIMAL(4,3),
	 p_arkivskaper SMALLINT,
	 p_statusTekst VARCHAR(100),
	 p_startDato DATE,
	 p_sluttDato DATE,
	 p_endretAv INTEGER
)
RETURNS INTEGER
BEGIN
	DECLARE p_filID INTEGER;

	INSERT INTO doklager(filnavn,filstørrelse)
		VALUES(p_filnavn,p_filStr);
	SET p_filID = LAST_INSERT_ID();
	INSERT INTO arkivpakke(arkivskaper,
		statusTekst,
		startDato,
		sluttDato,
		sistEndret,
		endretAv,
		dokfil)
		VALUES(p_arkivskaper,
			p_statusTekst,
			p_startDato,
			p_sluttDato,
			CURRENT_TIMESTAMP(),
			p_endretAv,
			p_filID);
	RETURN p_filID;
END::

CREATE FUNCTION kommuneEksisterer(p_kommunenavn VARCHAR(100))
	RETURNS BOOLEAN
	READS SQL DATA
BEGIN
	DECLARE p_eksisterer BOOLEAN;
	DECLARE v_resultat INT;
	SELECT 1 INTO v_resultat
	FROM kommune
	WHERE kommunenavn = p_kommunenavn;

	IF v_resultat = 1 THEN
		SET p_eksisterer = TRUE;
	ELSE
		SET p_eksisterer = FALSE;
	END IF;	
	RETURN p_eksisterer;
END::

CREATE TRIGGER arkivpakkeARU
AFTER UPDATE ON arkivpakke
FOR EACH ROW
BEGIN
	INSERT INTO logg(arkivID,arkivskaper,statusTekst,startDato,sluttDato,sistEndret,endretAv)
	VALUES(NEW.arkivID,NEW.arkivskaper,NEW.statusTekst,NEW.startDato,NEW.sluttDato,NEW.sistEndret,NEW.endretAv);
END::

CREATE TRIGGER arkivpakkeARI
AFTER INSERT ON arkivpakke
FOR EACH ROW
BEGIN
	INSERT INTO logg(arkivID,arkivskaper,statusTekst,startDato,sluttDato,sistEndret,endretAv)
	VALUES(NEW.arkivID,NEW.arkivskaper,NEW.statusTekst,NEW.startDato,NEW.sluttDato,NEW.sistEndret,NEW.endretAv);
END::

CREATE PROCEDURE slettArkivpakke
(
	IN p_arkivID INTEGER,
	IN p_brukernavn VARCHAR(100),
	OUT p_affectedRows INTEGER
)

BEGIN
	DECLARE p_brukerID INTEGER;
	DECLARE p_insertRow INTEGER;
	DECLARE p_deleteRow INTEGER;
	SELECT brukerID into p_brukerID FROM bruker WHERE brukernavn = p_brukernavn;
	DELETE FROM arkivpakke WHERE arkivID = p_arkivID;
	SET p_affectedRows = ROW_COUNT();
	INSERT INTO logg(arkivID,sistEndret,endretAv,slettet) VALUES(p_arkivID,CURRENT_TIMESTAMP(),p_brukerID,TRUE);
	SELECT ROW_COUNT() INTO p_deleteRow;
	SET p_affectedRows = p_affectedRows + ROW_COUNT();
END::

DELIMITER ;

INSERT INTO kommune
VALUES(101,'Halden'),
(104,'Moss'),
(105,'Sarpsborg'),
(106,'Fredrikstad'),
(111,'Hvaler'),
(118,'Aremark'),
(119,'Marker'),
(121,'Rømskog'),
(122,'Trøgstad'),
(123,'Spydeberg'),
(124,'Askim'),
(125,'Eidsberg'),
(127,'Skiptvet'),
(128,'Rakkestad'),
(135,'Råde'),
(136,'Rygge'),
(137,'Våler i Østfold'),
(138,'Hobøl'),
(211,'Vestby'),
(213,'Ski'),
(214,'Ås'),
(215,'Frogn'),
(216,'Nesodden'),
(217,'Oppegård'),
(219,'Bærum'),
(220,'Asker'),
(221,'Aurskog-Høland'),
(226,'Sørum'),
(227,'Fet'),
(228,'Rælingen'),
(229,'Enebakk'),
(230,'Lørenskog'),
(231,'Skedsmo'),
(233,'Nittedal'),
(234,'Gjerdrum'),
(235,'Ullensaker'),
(236,'Nes i Akershus'),
(237,'Eidsvoll'),
(238,'Nannestad'),
(239,'Hurdal'),
(301,'Oslo'),
(402,'Kongsvinger'),
(403,'Hamar'),
(412,'Ringsaker'),
(415,'Løten'),
(417,'Stange'),
(418,'Nord-Odal'),
(419,'Sør-Odal'),
(420,'Eidskog'),
(423,'Grue'),
(425,'Åsnes'),
(426,'Våler i Hedmark'),
(427,'Elverum'),
(428,'Trysil'),
(429,'Åmot'),
(430,'Stor-Elvdal'),
(432,'Rendalen'),
(434,'Engerdal'),
(436,'Tolga'),
(437,'Tynset'),
(438,'Alvdal'),
(439,'Folldal'),
(441,'Os i Hedmark'),
(501,'Lillehammer'),
(502,'Gjøvik'),
(511,'Dovre'),
(512,'Lesja'),
(513,'Skjåk'),
(514,'Lom'),
(515,'Vågå'),
(516,'Nord-Fron'),
(517,'Sel'),
(519,'Sør-Fron'),
(520,'Ringebu'),
(521,'Øyer'),
(522,'Gausdal'),
(528,'Østre Toten'),
(529,'Vestre Toten'),
(532,'Jevnaker'),
(533,'Lunner'),
(534,'Gran'),
(536,'Søndre Land'),
(538,'Nordre Land'),
(540,'Sør-Aurdal'),
(541,'Etnedal'),
(542,'Nord-Aurdal'),
(543,'Vestre Slidre'),
(544,'Øystre Slidre'),
(545,'Vang'),
(602,'Drammen'),
(604,'Kongsberg'),
(605,'Ringerike'),
(612,'Hole'),
(615,'Flå'),
(616,'Nes i Buskerud'),
(617,'Gol'),
(618,'Hemsedal'),
(619,'Ål'),
(620,'Hol'),
(621,'Sigdal'),
(622,'Krødsherad'),
(623,'Modum'),
(624,'Øvre Eiker'),
(625,'Nedre Eiker'),
(626,'Lier'),
(627,'Røyken'),
(628,'Hurum'),
(631,'Flesberg'),
(632,'Rollag'),
(633,'Nore og Uvdal'),
(701,'Horten'),
(704,'Tønsberg'),
(710,'Sandefjord'),
(711,'Svelvik'),
(712,'Larvik'),
(713,'Sande i Vestfold'),
(715,'Holmestrand'),
(716,'Re'),
(729,'Færder'),
(805,'Porsgrunn'),
(806,'Skien'),
(807,'Notodden'),
(811,'Siljan'),
(814,'Bamble'),
(815,'Kragerø'),
(817,'Drangedal'),
(819,'Nome'),
(821,'Bø i Telemark'),
(822,'Sauherad'),
(826,'Tinn'),
(827,'Hjartdal'),
(828,'Seljord'),
(829,'Kviteseid'),
(830,'Nissedal'),
(831,'Fyresdal'),
(833,'Tokke'),
(834,'Vinje'),
(901,'Risør'),
(904,'Grimstad'),
(906,'Arendal'),
(911,'Gjerstad'),
(912,'Vegårshei'),
(914,'Tvedestrand'),
(919,'Froland'),
(926,'Lillesand'),
(928,'Birkenes'),
(929,'Åmli'),
(935,'Iveland'),
(937,'Evje og Hornnes'),
(938,'Bygland'),
(940,'Valle'),
(941,'Bykle'),
(1001,'Kristiansand'),
(1002,'Mandal'),
(1003,'Farsund'),
(1004,'Flekkefjord'),
(1014,'Vennesla'),
(1017,'Songdalen'),
(1018,'Søgne'),
(1021,'Marnardal'),
(1026,'Åseral'),
(1027,'Audnedal'),
(1029,'Lindesnes'),
(1032,'Lyngdal'),
(1034,'Hægebostad'),
(1037,'Kvinesdal'),
(1046,'Sirdal'),
(1101,'Eigersund'),
(1102,'Sandnes'),
(1103,'Stavanger'),
(1106,'Haugesund'),
(1111,'Sokndal'),
(1112,'Lund'),
(1114,'Bjerkreim'),
(1119,'Hå'),
(1120,'Klepp'),
(1121,'Time'),
(1122,'Gjesdal'),
(1124,'Sola'),
(1127,'Randaberg'),
(1129,'Forsand'),
(1130,'Strand'),
(1133,'Hjelmeland'),
(1134,'Suldal'),
(1135,'Sauda'),
(1141,'Finnøy'),
(1142,'Rennesøy'),
(1144,'Kvitsøy'),
(1145,'Bokn'),
(1146,'Tysvær'),
(1149,'Karmøy'),
(1151,'Utsira'),
(1160,'Vindafjord'),
(1201,'Bergen'),
(1211,'Etne'),
(1216,'Sveio'),
(1219,'Bømlo'),
(1221,'Stord'),
(1222,'Fitjar'),
(1223,'Tysnes'),
(1224,'Kvinnherad'),
(1227,'Jondal'),
(1228,'Odda'),
(1231,'Ullensvang'),
(1232,'Eidfjord'),
(1233,'Ulvik'),
(1234,'Granvin'),
(1235,'Voss'),
(1238,'Kvam'),
(1241,'Fusa'),
(1242,'Samnanger'),
(1243,'Os i Hordaland'),
(1244,'Austevoll'),
(1245,'Sund'),
(1246,'Fjell'),
(1247,'Askøy'),
(1251,'Vaksdal'),
(1252,'Modalen'),
(1253,'Osterøy'),
(1256,'Meland'),
(1259,'Øygarden'),
(1260,'Radøy'),
(1263,'Lindås'),
(1264,'Austrheim'),
(1265,'Fedje'),
(1266,'Masfjorden'),
(1401,'Flora'),
(1411,'Gulen'),
(1412,'Solund'),
(1413,'Hyllestad'),
(1416,'Høyanger'),
(1417,'Vik'),
(1418,'Balestrand'),
(1419,'Leikanger'),
(1420,'Sogndal'),
(1421,'Aurland'),
(1422,'Lærdal'),
(1424,'Årdal'),
(1426,'Luster'),
(1428,'Askvoll'),
(1429,'Fjaler'),
(1430,'Gaular'),
(1431,'Jølster'),
(1432,'Førde'),
(1433,'Naustdal'),
(1438,'Bremanger'),
(1439,'Vågsøy'),
(1441,'Selje'),
(1443,'Eid'),
(1444,'Hornindal'),
(1445,'Gloppen'),
(1449,'Stryn'),
(1502,'Molde'),
(1504,'Ålesund'),
(1505,'Kristiansund'),
(1511,'Vanylven'),
(1514,'Sande i Møre og Romsdal'),
(1515,'Herøy i Møre og Romsdal'),
(1516,'Ulstein'),
(1517,'Hareid'),
(1519,'Volda'),
(1520,'Ørsta'),
(1523,'Ørskog'),
(1524,'Norddal'),
(1525,'Stranda'),
(1526,'Stordal'),
(1528,'Sykkylven'),
(1529,'Skodje'),
(1531,'Sula'),
(1532,'Giske'),
(1534,'Haram'),
(1535,'Vestnes'),
(1539,'Rauma'),
(1543,'Nesset'),
(1545,'Midsund'),
(1546,'Sandøy'),
(1547,'Aukra'),
(1548,'Fræna'),
(1551,'Eide'),
(1554,'Averøy'),
(1557,'Gjemnes'),
(1560,'Tingvoll'),
(1563,'Sunndal'),
(1566,'Surnadal'),
(1567,'Rindal'),
(1571,'Halsa'),
(1573,'Smøla'),
(1576,'Aure'),
(1804,'Bodø'),
(1805,'Narvik'),
(1811,'Bindal'),
(1812,'Sømna'),
(1813,'Brønnøy'),
(1815,'Vega'),
(1816,'Vevelstad'),
(1818,'Herøy i Nordland'),
(1820,'Alstahaug'),
(1822,'Leirfjord'),
(1824,'Vefsn'),
(1825,'Grane'),
(1826,'Hattfjelldal'),
(1827,'Dønna'),
(1828,'Nesna'),
(1832,'Hemnes'),
(1833,'Rana'),
(1834,'Lurøy'),
(1835,'Træna'),
(1836,'Rødøy'),
(1837,'Meløy'),
(1838,'Gildeskål'),
(1839,'Beiarn'),
(1840,'Saltdal'),
(1841,'Fauske – Fuossko'),
(1845,'Sørfold'),
(1848,'Steigen'),
(1849,'Hamarøy – Hábmer'),
(1850,'Divtasvuodna – Tysfjord'),
(1851,'Lødingen'),
(1852,'Tjeldsund'),
(1853,'Evenes'),
(1854,'Ballangen'),
(1856,'Røst'),
(1857,'Værøy'),
(1859,'Flakstad'),
(1860,'Vestvågøy'),
(1865,'Vågan'),
(1866,'Hadsel'),
(1867,'Bø i Nordland '),
(1868,'Øksnes'),
(1870,'Sortland'),
(1871,'Andøy'),
(1874,'Moskenes'),
(1902,'Tromsø'),
(1903,'Harstad'),
(1911,'Kvæfjord'),
(1913,'Skånland'),
(1917,'Ibestad'),
(1919,'Gratangen'),
(1920,'Loabák – Lavangen'),
(1922,'Bardu'),
(1923,'Salangen'),
(1924,'Målselv'),
(1925,'Sørreisa'),
(1926,'Dyrøy'),
(1927,'Tranøy'),
(1928,'Torsken'),
(1929,'Berg'),
(1931,'Lenvik'),
(1933,'Balsfjord'),
(1936,'Karlsøy'),
(1938,'Lyngen'),
(1939,'Storfjord – Omasvuotna – Omasvuono'),
(1940,'Gáivuotna – Kåfjord – Kaivuono'),
(1941,'Skjervøy'),
(1942,'Nordreisa'),
(1943,'Kvænangen'),
(2002,'Vardø'),
(2003,'Vadsø'),
(2004,'Hammerfest'),
(2011,'Guovdageaidnu – Kautokeino'),
(2012,'Alta'),
(2014,'Loppa'),
(2015,'Hasvik'),
(2017,'Kvalsund'),
(2018,'Måsøy'),
(2019,'Nordkapp'),
(2020,'Porsanger – Porsáŋgu – Porsanki'),
(2021,'Kárášjohka – Karasjok '),
(2022,'Lebesby'),
(2023,'Gamvik'),
(2024,'Berlevåg'),
(2025,'Deatnu – Tana'),
(2027,'Unjárga – Nesseby'),
(2028,'Båtsfjord'),
(2030,'Sør-Varanger'),
(5001,'Trondheim '),
(5004,'Steinkjer'),
(5005,'Namsos'),
(5011,'Hemne'),
(5012,'Snillfjord'),
(5013,'Hitra'),
(5014,'Frøya'),
(5015,'Ørland'),
(5016,'Agdenes'),
(5017,'Bjugn'),
(5018,'Åfjord'),
(5019,'Roan'),
(5020,'Osen'),
(5021,'Oppdal'),
(5022,'Rennebu'),
(5023,'Meldal'),
(5024,'Orkdal'),
(5025,'Røros'),
(5026,'Holtålen'),
(5027,'Midtre Gauldal'),
(5028,'Melhus'),
(5029,'Skaun'),
(5030,'Klæbu'),
(5031,'Malvik'),
(5032,'Selbu'),
(5033,'Tydal'),
(5034,'Meråker'),
(5035,'Stjørdal'),
(5036,'Frosta'),
(5037,'Levanger'),
(5038,'Verdal'),
(5039,'Verran'),
(5040,'Namdalseid'),
(5041,'Snåase – Snåsa'),
(5042,'Lierne'),
(5043,'Raarvikhe – Røyrvik'),
(5044,'Namsskogan'),
(5045,'Grong'),
(5046,'Høylandet'),
(5047,'Overhalla'),
(5048,'Fosnes'),
(5049,'Flatanger'),
(5050,'Vikna'),
(5051,'Nærøy'),
(5052,'Leka'),
(5053,'Inderøy'),
(5054,'Indre Fosen');

INSERT INTO bruker
(brukernavn,passord,fornavn,etternavn)
/*passord=chr*/
VALUES('chr','$2y$10$MMCHDo75Vwme2.AN5ipcCOnyqq/w5Q3qaG9XNfArR3YvtrxaHFZYK','cecilie','hansen rørås'),
/*passord=123*/
('tv','$2y$10$RRB1SmieMcqIL1fqzNWP/ub06b4VNi3lBLX1J2/dH7BZcWp5M6zEC','tarald','vestbøstad'),
/*passord=olav*/
('olav','$2y$10$/PRHBHkwLEQ/gxwo8MatBOITEAavGJovd74yD0MyDTzU1QV0QWdBK','olav','aleksander lysenstøen');

INSERT INTO statustype
VALUES('avtalt'),
('mottatt'),
('i karantene'),
('avvist, venter ny deponering'),
('i test'),
('godkjent'),
('i dsm');

INSERT INTO doklager(filnavn,filstørrelse)
VALUES ('Folldal.xml',3.978),
('Eidskog.xml',3.723),
('Bygland.xml',1.734),
('Beiarn.xml',4.866),
('Kvinnherad.xml',4.784),
('Alstahaug.xml',3.241),
('Rollag.xml',2.836),
('Overhalla.xml',2.895),
('Rendalen.xml',2.297),
('Hobøl.xml',4.339),
('Lenvik.xml',1.583),
('Haugesund.xml',3.543),
('Averøy.xml',1.482),
('Fitjar.xml',1.627),
('Stordal.xml',1.105),
('Sigdal.xml',2.199),
('Nore og Uvdal.xml',3.764),
('Rauma.xml',3.62),
('Rollag.xml',4.689),
('Dønna.xml',1.079),
('Åfjord.xml',1.854),
('Nore og Uvdal.xml',2.882),
('Hemsedal.xml',4.02),
('Etne.xml',1.723),
('Vadsø.xml',2.335),
('Fosnes.xml',2.398),
('Sokndal.xml',2.256),
('Askvoll.xml',1.192),
('Ringsaker.xml',4.635),
('Åsnes.xml',1.326),
('Spydeberg.xml',1.443),
('Frøya.xml',3.308),
('Lesja.xml',3.137),
('Meldal.xml',3.096),
('Ibestad.xml',1.445),
('Andøy.xml',1.084),
('Fauske – Fuossko.xml',1.795),
('Åfjord.xml',3.899),
('Nannestad.xml',2.836),
('Namsos.xml',2.904);

INSERT INTO arkivpakke(arkivskaper, statusTekst, startDato, sluttDato, sistEndret, endretAv, dokfil)
VALUES (439,'i dsm','2002-6-19','2008-8-25',CURRENT_TIMESTAMP(),3,1),
(420,'godkjent','2002-2-23','2011-4-25',CURRENT_TIMESTAMP(),3,2),
(938,'i dsm','2007-5-10','2015-8-27',CURRENT_TIMESTAMP(),2,3),
(1839,'mottatt','2008-7-22','2011-9-15',CURRENT_TIMESTAMP(),3,4),
(1224,'mottatt','2006-10-17','2010-8-10',CURRENT_TIMESTAMP(),3,5),
(1820,'i test','2001-11-12','2006-10-2',CURRENT_TIMESTAMP(),3,6),
(632,'i dsm','2011-4-18','2016-2-7',CURRENT_TIMESTAMP(),1,7),
(5047,'i dsm','2003-10-5','2008-4-1',CURRENT_TIMESTAMP(),1,8),
(432,'i karantene','2005-2-27','2012-7-19',CURRENT_TIMESTAMP(),3,9),
(138,'i dsm','2009-8-15','2011-11-12',CURRENT_TIMESTAMP(),3,10),
(1931,'avtalt','2004-1-8','2010-9-20',CURRENT_TIMESTAMP(),2,11),
(1106,'avvist, venter ny deponering','2001-8-25','2004-7-14',CURRENT_TIMESTAMP(),2,12),
(1554,'i test','2010-4-17','2015-7-7',CURRENT_TIMESTAMP(),1,13),
(1222,'godkjent','2000-4-16','2014-6-12',CURRENT_TIMESTAMP(),3,14),
(1526,'godkjent','2000-8-5','2005-8-21',CURRENT_TIMESTAMP(),1,15),
(621,'avvist, venter ny deponering','2001-7-4','2015-2-24',CURRENT_TIMESTAMP(),3,16),
(633,'i dsm','2005-1-15','2012-1-27',CURRENT_TIMESTAMP(),2,17),
(1539,'mottatt','2010-1-26','2017-7-2',CURRENT_TIMESTAMP(),3,18),
(632,'godkjent','2014-4-2','2015-11-16',CURRENT_TIMESTAMP(),2,19),
(1827,'i dsm','2004-7-10','2015-2-3',CURRENT_TIMESTAMP(),3,20),
(5018,'i test','2007-10-26','2008-1-19',CURRENT_TIMESTAMP(),2,21),
(633,'avvist, venter ny deponering','2001-2-27','2011-3-7',CURRENT_TIMESTAMP(),1,22),
(618,'godkjent','2002-2-18','2007-6-10',CURRENT_TIMESTAMP(),1,23),
(1211,'i dsm','2002-3-20','2014-8-12',CURRENT_TIMESTAMP(),1,24),
(2003,'i test','2012-9-21','2017-9-14',CURRENT_TIMESTAMP(),3,25),
(5048,'i dsm','2011-9-12','2017-3-28',CURRENT_TIMESTAMP(),3,26),
(1111,'avtalt','2009-2-9','2014-11-7',CURRENT_TIMESTAMP(),1,27),
(1428,'mottatt','2006-4-8','2007-4-5',CURRENT_TIMESTAMP(),1,28),
(412,'avvist, venter ny deponering','2000-7-13','2003-8-15',CURRENT_TIMESTAMP(),1,29),
(425,'i karantene','2004-10-24','2005-5-25',CURRENT_TIMESTAMP(),1,30),
(123,'mottatt','2000-5-11','2012-3-27',CURRENT_TIMESTAMP(),3,31),
(5014,'avvist, venter ny deponering','2004-2-6','2011-8-11',CURRENT_TIMESTAMP(),3,32),
(512,'i karantene','2002-8-22','2012-2-23',CURRENT_TIMESTAMP(),1,33),
(5023,'godkjent','2007-6-27','2012-1-20',CURRENT_TIMESTAMP(),3,34),
(1917,'i dsm','2001-6-24','2006-4-19',CURRENT_TIMESTAMP(),2,35),
(1871,'i test','2007-9-26','2011-7-18',CURRENT_TIMESTAMP(),2,36),
(1841,'i test','2004-11-11','2017-1-7',CURRENT_TIMESTAMP(),1,37),
(5018,'mottatt','2004-5-24','2015-5-28',CURRENT_TIMESTAMP(),2,38),
(238,'avvist, venter ny deponering','2003-9-22','2010-5-5',CURRENT_TIMESTAMP(),1,39),
(5005,'godkjent','2009-7-16','2012-9-10',CURRENT_TIMESTAMP(),1,40);


UPDATE arkivpakke SET statusTekst = 'avvist, venter ny deponering',endretAv = 1 WHERE arkivID = 1;
UPDATE arkivpakke SET sluttDato = '2015-10-22',endretAv = 1 WHERE arkivID = 1;
UPDATE arkivpakke SET statusTekst = 'avvist, venter ny deponering',endretAv = 1 WHERE arkivID = 1;
UPDATE arkivpakke SET sluttDato = '2018-01-22',endretAv = 2 WHERE arkivID = 1;
UPDATE arkivpakke SET sluttDato = '2016-01-01',endretAv = 2 WHERE arkivID = 1;
UPDATE arkivpakke SET statusTekst = 'avtalt',endretAv = 1 WHERE arkivID = 1;