formatted-field.js
==================

Native javascript widget which formats input value to match a pattern.

Usage
-----

#### new FormattedField(elem, options)

	var elem = document.getElementById('phone');
	
	var field = new FormattedField(elem, {
		pattern: '+9 (999) 999-99-99',
	});

Options
-------

* **pattern** {string}: String consisting of special symbols: 9 - for numbers and other custom symbols (space and +().-).
```
	pattern: '+9 (999) 999-99-99'
```

* **minlength** {int} (optional): Integer value of minimal length of the formatted field value. For example, lenght of the pattern string above is 18.
```
	minlength: 18
```

* **replace** {array|object} (optional): Array of objects (or single object) which designed for replacement some pattern {string|RegExp} (self) by a string (value).
```
	replace: [
	   { self: ',', value: '.' },
	   { self: /\s/, value: '' }
	]
```

* **customReplace** {object} (optional): Object for the replace some symbol of the field value with other symbol.
  * First example: second symbol is always 7.
  * Second example: if the second symbol is matched as 8 it will be replaced with 7.
```
	customReplace: {
	   2: [{ value: 7 }]
	}
	customReplace: {
	   2: [{
	      self: 8,
	      value: 7
	   }]
	}
```

* **customPattern** {object} (optional): Object containing other patterns which will be used instead default **pattern** option in case of matching field value to the key of the object.
```
	customPattern: {
	   '380': '+999 (999) 999-99-99'
	}
```
