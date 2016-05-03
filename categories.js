"use strict";

/**
 * This array represents categories and corresponding keywords
 * that are particularly used in Austria.
 */

var categories = [
  {
    name: 'income',
    keywords: [],
    label: {
      de: 'Einnahmen',
      en: 'Income'
    },
    color: '#009688'
  },
	{
		name: 'salary',
		keywords: ['Bezug', 'Gehalt', 'Lohn'],
    label: {
      de: 'Gehalt',
      en: 'Salary'
    },
    parent: 'income',
    color: '#4caf50'
	},
	{
		name: 'investment',
		keywords: ['Fondsgebundene Lebensversicherung'],
    label: {
      de: 'Anlage',
      en: 'Investment'
    },
    parent: 'income',
    color: '#8bc34a'
	},
	{
		name: 'interest',
		keywords: ['zinsen'],
    label: {
      de: 'Zinsen',
      en: 'Interest'
    },
    parent: 'income',
    color: '#009688'
	},
  {
    name: 'transfers',
    keywords: [],
    label: {
      de: 'Umbuchungen',
      en: 'Transfers'
    },
    color: '#607d8b'
  },
  {
    name: 'expenses',
    keywords: [],
    label: {
      de: 'Ausgaben',
      en: 'Expenses'
    },
    color: '#ff5722'
  },
  {
    name: 'debts',
    keywords: ['geborgt', 'Schulden'],
    label: {
      de: 'Schulden',
      en: 'Debts'
    },
    color: '#607d8b',
    parent: 'transfers'
  },
	{
		name: 'self',
		keywords: ['de giro', 'Kalixa Pay', 'Eigenerlag', 'Diners Club Kontoauszug', 'RENAULT BANK', 'Bankkonto',
               // PayPal-conversions
               'in Euro', 'in US-Dollar', 'von Euro', 'von US-Dollar'],
    label: {
      de: 'Eigene',
      en: 'Self'
    },
    color: '#607d8b',
    parent: 'transfers'
	},
	{
		name: 'atm',
		keywords: ['auszahlung', 'ATM ', 'SB-BEHEBUNG', ' AUTOMAT ', 'BANKOMAT'],
    label: {
      de: 'Banko&shy;mat',
      en: 'ATM'
    },
    parent: 'transfers',
    color: '#607d8b'
	},
	{
		name: 'housing',
		keywords: [],
    label: {
      de: 'Wohnen',
      en: 'Housing'
    },
    parent: 'expenses',
    color: '#2196f3'
	},
	{
		name: 'rent',
		keywords: ['Miete'],
    label: {
      de: 'Miete',
      en: 'Rent'
    },
    parent: 'housing',
    color: '#2196f3'
	},
  {
    name: 'utilities',
    keywords: ['Energie Burgenland', 'Strom', 'Wasser'],
    label: {
      de: 'Betriebskosten',
      en: 'Utilities'
    },
    parent: 'housing',
    color: '#2196f3'
  },
	{
		name: 'furniture',
		keywords: ['wohnung', 'obi bau', 'mobelix', 'ikea', 'kika', 'xxxlutz', 'BAUHAUS'],
    label: {
      de: 'Möbel (Wohnungsausstattung) & Heimwerken',
      en: 'Furniture & DIY'
    },
    parent: 'housing',
    color: '#2196f3'
	},
  {
    name: 'food & household',
    keywords: ['LIBRO'],
    label: {
      de: 'Lebensmittel und Haushalt',
      en: 'Food and Household'
    },
    parent: 'expenses',
    color: '#00bcd4'
  },
	{
		name: 'supermarket',
		keywords: ['billa', 'merkur', 'penny', 'zielpunkt', 'spar dankt', 'hofer', 'LIDL ', ' REWE '],
    label: {
      de: 'Supermarkt',
      en: 'Supermarket'
    },
    parent: 'food & household',
    color: '#00bcd4'
	},
  {
    name: 'fast food',
    keywords: ['MCDONALDS', 'Subway Sandwich Store'],
    label: {
      de: 'Fast Food',
      en: 'Fast Food'
    },
    parent: 'food & household',
    color: '#00bcd4'
  },
  {
    name: 'restaurant',
    keywords: [' VAPIANO '],
    label: {
      de: 'Restaurant',
      en: 'Restaurant'
    },
    parent: 'food & household',
    color: '#00bcd4'
  },
  {
    name: 'trafik',
    keywords: ['TABAK', 'Trafik'],
    label: {
      de: 'Trafik',
      en: 'Tobacconist\'s'
    },
    parent: 'food & household',
    color: '#00bcd4'
  },
  {
    name: 'education',
    keywords: ['Universität'],
    label: {
      de: 'Bildung',
      en: 'Education'
    },
    parent: 'expenses',
    color: '#9c27b0'
  },
	{
		name: 'transportation',
		keywords: ['oebb', 'wr.linien', 'Wiener Linien', 'WR. LINIEN', 'LINZ LINIEN', 'db bahn', 'ÖBB-Personenverkehr', 'Flixbus'],
    label: {
      de: 'Verkehr',
      en: 'Transportation'
    },
    parent: 'expenses',
    color: '#3f51b5'
	},
	{
		name: 'car',
		keywords: ['forstinger', 'Autohaus'],
    label: {
      de: 'Auto',
      en: 'Car'
    },
    parent: 'transportation',
    color: '#3f51b5'
	},
	{
		name: 'fuel',
		keywords: ['omv', 'tankstelle', 'ENI ', 'eni servicestation', ' bp ', ' JET ', ' SHELL ', ' AVANTI ', 'IQ ', 'Sprit', 'AWI', 'MOL '],
    label: {
      de: 'Sprit',
      en: 'Fuel'
    },
    parent: 'transportation',
    color: '#3f51b5'
	},
	{
		name: 'phone',
		keywords: ['telekom austria', 'Hutchison Drei', 'HOT Telekom', ' Bob'],
    label: {
      de: 'Tele&shy;kommuni&shy;kation',
      en: 'Phone'
    },
    parent: 'bills-utilities',
    color: '#673ab7'
	},
	{
		name: 'shopping',
		keywords: ['ebay'],
    label: {
      de: 'Einkauf',
      en: 'Shopping'
    },
    parent: 'expenses',
    color: '#ffeb3b'
	},
  {
    name: 'amazon',
    keywords: ['amazon'],
    label: {
      de: 'Amazon',
      en: 'Amazon'
    },
    parent: 'shopping',
    color: '#ffeb3b'
  },
	{
		name: 'electronics',
		keywords: ['cyberport', 'hartlauer', 'DITECH', 'SATURN', 'NIEDERMEYER ', 'Media Markt'],
    label: {
      de: 'Elektronik',
      en: 'Electronics'
    },
    parent: 'shopping',
    color: '#ffeb3b'
	},
	{
		name: 'clothes',
		keywords: ['timberland', 'green ground', 'gea', 'outlet\\\\parndorf', 'deichmann', 'BURLINGTON', 'VEGANOVA', 'ebenberg', 'C&A MODE', 'C&A Store', 'H&M', 'Voegele', 'Adler Modemaerkte'],
    label: {
      de: 'Kleidung',
      en: 'Clothes'
    },
    parent: 'shopping',
    color: '#ffeb3b'
	},
	{
		name: 'books',
		keywords: ['thalia'],
    label: {
      de: 'Bücher',
      en: 'Books'
    },
    parent: 'shopping',
    color: '#ffeb3b'
	},
	{
		name: 'sports',
		keywords: ['sportsdirect', 'hervis', 'uni wien usi', 'SPORTS EXPERTS'],
    label: {
      de: 'Sport',
      en: 'Sports'
    },
    parent: 'expenses',
    color: '#ff9800'
	},
  {
    name: 'entertainment',
    keywords: ['Konzert', 'Kino'],
    label: {
      de: 'Unterhaltung',
      en: 'Entertainment'
    },
    parent: 'expenses',
    color: '#f44336'
  },
	{
		name: 'travel',
		keywords: ['urlaub', 'flüge', 'hostel ', 'Flugticket'],
    label: {
      de: 'Reisen',
      en: 'Travel'
    },
    parent: 'expenses',
    color: '#f44336'
	},
	{
		name: 'taxes',
		keywords: ['sozialvers', ' KESt '],
    label: {
      de: 'Steuern',
      en: 'Taxes'
    },
    parent: 'expenses',
    color: '#e91e63'
	},
	{
		name: 'social insurance',
		keywords: ['Österreichische Beamtenversicherung', 'Osterreichische Beamtenversicherung', 'Versicherung'],
    label: {
      de: 'Sozialversicherung',
      en: 'Social Insurance'
    },
    parent: 'expenses',
    color: '#e91e63'
	},
	{
		name: 'gifts',
		keywords: ['Geburtstagsgeschenk', 'Geschenk'],
    label: {
      de: 'Geschenke',
      en: 'Gifts'
    },
    parent: 'expenses',
    color: '#ffc107'
	},
  {
    name: 'donations',
    keywords: ['Amnesty International', 'BONFAREMO', 'Bonfaremo', 'Spendenkonto', 'Spende'],
    label: {
      de: 'Spenden',
      en: 'Donations'
    },
    parent: 'expenses',
    color: '#ffc107'
  }
];
