/**
 * Formatted field widget
 * @version 1.0.2
 * @author mfyodorov
 * @license MIT
 */

/**
 * Formatted field widget
 * @param {Element} element
 * @param {object} options
 */
function FormattedField(elem, options)
{
	var defaultPattern = options.pattern || '',
		customPattern = options.customPattern || {},
		minlength = options.minlength || 0,
		replace = options.replace || {};
	
	var pattern, digits, currentPattern, maxlength, allowed;
	
	pattern = customPattern;
	pattern.default = defaultPattern;
	
	var lib = { '9': '\\d', ' ': '\\s', '+': '\\+', '(': '\\(', ')': '\\)', '.': '\\.' };
	
	init();
	
	function init()
	{
		formatValue();
	
		elem.onkeypress = function(e)
		{
			e = e || event;

			if (e.ctrlKey || e.altKey || e.metaKey) 
				return;

			var chr = getChar(e);

			if (chr == null) 
				return;

			return checkCharacter(chr);
		};
		
		elem.onkeyup = function(e)
		{
			formatValue();
		};
	}
	
	function formatValue()
	{
		digits = getDigits(elem.value);		
		currentPattern = getFormatExp();			
		allowed = getAllowedRegExp();		
		maxlength = currentPattern.length;
		
		elem.setAttribute('maxlength', maxlength);
		elem.setAttribute('minlength', minlength);
		
		if (!checkFormat(elem.value))
		{
			elem.value = getFormattedValue();
		}
	}
	
	function checkFormat(value)
	{
		if (value.length > maxlength)
			return false;
		
		for (var i in value)
		{
			var regexp = getRegExp(currentPattern[i]);
			if (!regexp.test(value[i]))
				return false;
			var replace = getReplacedValue(i, value[i]);
			if (replace !== false)
				return false;
		}
		return true;
	}
	
	function checkCharacter(chr)
	{
		return allowed.test(chr);
	}
	
	function getDigits(value)
	{
		var digits = value;
		return digits.replace(/\D*/g, '');
	}
	
	function getFormattedValue()
	{
		var formatted = '',
			digitIndex = 0;
			
		for (var i in currentPattern)
		{
			if (digits.length <= digitIndex)
				break;
			
			if (currentPattern[i] == '9')
			{
				var replace = getReplacedValue(i, digits[digitIndex]);
				formatted += (replace !== false ? replace : digits[digitIndex]);
				digitIndex++;
			}
			else
			{
				formatted += currentPattern[i];
			}
		}
		return formatted;
	}
	
	function getFormatExp()
	{
		for (var key in pattern)
		{
			if (key == 'default')
				continue;
			
			var regexp = new RegExp('^' + key);
			if (regexp.test(digits) === true)
			{
				return pattern[key];
			}
		}
		
		return pattern.default;
	}
	
	function getReplacedValue(i, value)
	{
		i = parseInt(i) + 1;
		
		if (replace.hasOwnProperty(i))
		{
			for (var k in replace[i])
			{
				var regexp;
				
				if (replace[i][k].hasOwnProperty('self'))
				{
					regexp = new RegExp(replace[i][k].self);
					if (regexp.test(value))
						return replace[i][k].value;
				}
				if (replace[i][k].hasOwnProperty('all'))
				{				
					regexp = new RegExp(replace[i][k].all);
					if (regexp.test(elem.value))
						return replace[i][k].value;
				}
			}
		}
		return false;
	}
	
	function getRegExp(chr)
	{
		var string = getRegExpString(chr);
		return new RegExp(string);
	}
	
	function getRegExpString(chr)
	{
		return (lib.hasOwnProperty(chr) ? lib[chr] : chr);
	}
	
	function getAllowedRegExp()
	{
		var unique = [],
			string = '';
			
		for (var i in currentPattern)
		{
			if (unique.indexOf(currentPattern[i]) == -1)
			{
				unique.push(currentPattern[i]);
				string += getRegExpString(currentPattern[i]);
			}
		}
		return new RegExp('[' + string + ']');
	}
	
	function getChar(event)
	{
		if (event.which == null)
		{
			if (event.keyCode < 32)
				return null;
			return String.fromCharCode(event.keyCode);
		}
		if (event.which != 0 && event.charCode != 0)
		{
			if (event.which < 32)
				return null;
			return String.fromCharCode(event.which);
		}
		return null;
	}
}