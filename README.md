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

* **pattern** {string}: String consisting of special symbols (9 - for numbers, custom symbols +,(, ,),- ).
  * For example: +9 (999) 999-99-99 or 9999.9999
* **minlength** {int} (optional): Integer value of minimal length of the formatted field value.
* **replace** {object} (optional): Object for the replace some symbol of the field value with other symbol. For example code below as replace parameter object means that if the second symbol is matched as 8 it will be replaced with 7.
```
{
   2: [{
      self: 8,
      value: 7
   }]
}
```
* **customPattern** {object} (optional): Object containing other patterns which will be used instead default **pattern** option in case of matching field value to the key of the object.
```
{
   '380': '+999 (99) 999-99-99'
}
```
