/**
 * Formatted field widget
 * @version 1.1.0
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
	var state = {
		replace: getReplace(options.replace),
		customReplace: options.customReplace || {},
		pattern: false,
		currentPattern: '', 
		digits: '', 
		minlength: options.minlength || false,	
		maxlength: '',
		allowed: {}
	};
	
	if (options.pattern)
	{	
		state.pattern = options.customPattern || {};
		createPatterns(options.pattern);
	}
	
	init();
	
	function init()
	{
		if (state.minlength)
			elem.setAttribute('pattern', '.{' + state.minlength + ',}');
			
		formatValue();
	
		if (state.pattern)
		{
			elem.onkeypress = function(e)
			{
				e = e || event;

				if (e.ctrlKey || e.altKey || e.metaKey) 
					return;

				var chr = getChar(e);

				if (chr == null) 
					return;

				return checkCharacter(chr, state.allowed, state.replace, elem);
			};
		}
		
		elem.onkeyup = function(e)
		{
			formatValue();
		};
	}
	
	function formatValue()
	{
		for (var i in state.replace)
			elem.value = elem.value.replace(state.replace[i]['self'], state.replace[i]['value']);
		
		if (!state.pattern)
			return;
			
		state.digits = getDigits(elem.value);
		
		var pattern = getPattern();
		if (!Array.isArray(pattern))
			pattern = [pattern];
		
		for (var i in pattern)
		{
			state.currentPattern = pattern[i];
			state.allowed = getAllowed(state.currentPattern, state.replace);	
			state.maxlength = state.currentPattern.length;
			
			var check = checkFormat(elem.value);
			
			if (check.flag)
				return;
			
			if (check.type === 'replace')
				break;
		}
	
		elem.value = getFormattedValue();
	}
	
	function checkFormat(value)
	{
		if (value.length > state.maxlength)
			return { flag: false, type: 'length' };
		
		for (var i in value)
		{
			var regexp = getCharRegExp(state.currentPattern[i]);
			if (!regexp.test(value[i]))
				return { flag: false, type: 'pattern' };
			
			var needReplace = getCustomReplacedValue(i, value[i]);
			
			if (needReplace !== false)
				return { flag: false, type: 'replace' };
		}
		return { flag: true };
	}
	
	function getFormattedValue()
	{
		var formatted = '',
			digitIndex = 0;
			
		for (var i in state.currentPattern)
		{
			if (state.digits.length <= digitIndex)
				break;
			
			if (state.currentPattern[i] == '9')
			{
				var replace = getCustomReplacedValue(i, state.digits[digitIndex]);
				formatted += (replace !== false ? replace : state.digits[digitIndex]);
				digitIndex++;
			}
			else
			{
				formatted += state.currentPattern[i];
			}
		}
		return formatted;
	}
	
	function getPattern()
	{
		for (var key in state.pattern)
		{
			if (key == 'default')
				continue;
			
			var regexp = new RegExp('^' + key);
			if (regexp.test(state.digits) === true)
			{
				return state.pattern[key];
			}
		}
		
		return state.pattern.default;
	}
	
	function getCustomReplacedValue(i, value)
	{
		i = parseInt(i) + 1;
		
		if (state.customReplace.hasOwnProperty(i))
		{
			for (var k in state.customReplace[i])
			{
				if (state.customReplace[i][k].hasOwnProperty('self'))
				{
					var regexp = new RegExp(state.customReplace[i][k].self);
					if (regexp.test(value))
						return state.customReplace[i][k].value;
				}
				else if (state.customReplace[i][k].hasOwnProperty('all'))
				{				
					var regexp = new RegExp(state.customReplace[i][k].all);
					if (regexp.test(elem.value))
						return state.customReplace[i][k].value;
				}
				else
				{
					return state.customReplace[i][k].value;
				}
			}
		}
		return false;
	}
	
	function createPatterns(pattern)
	{
		if (!state.pattern.hasOwnProperty('default'))
			state.pattern.default = [ pattern.replace(/\?/g,'') ];
		
		var index = pattern.indexOf('?');

		if (index !== -1)
		{
			newPattern = (
				(index > 1 ? pattern.substring(0, index-1) : '') 
				+ (index < pattern.length ? pattern.substring(index+1) : '')
			);
			state.pattern.default.push(newPattern.replace(/\?/g,''));
			createPatterns(newPattern);
		}
		else
		{
			state.pattern.default = state.pattern.default.reverse();
		}
	}
	
	function getReplace(optionsReplace)
	{
		var replace = [];
		
		if (typeof optionsReplace === 'object')
		{			
			if (Array.isArray(optionsReplace))
				replace = optionsReplace;
			else
				replace.push(optionsReplace);
			
			replace = replace.filter(function(item) {
				if (item.self)
					return { 
						self: item.self, 
						value: (typeof item.value === 'string' ? item.value : '') 
					};
			});
		}
		
		return replace;
	}
	
	function getAllowed(pattern, replace)
	{
		var unique = {},
			string = '';
			
		for (var i in pattern)
			addToAllowed(pattern[i], unique);
		
		return unique;
	}
	
	function addToAllowed(symbol, allowed)
	{
		if (Object.keys(allowed).indexOf(symbol) === -1)
			allowed[symbol] = ({ regexp: getCharRegExp(symbol, 'g'), count: 1 });
		else
			++allowed[symbol].count;
	}
	
	function getCharRegExp(chr, flags)
	{
		var string = getCharRegExpString(chr);
		return new RegExp(string, flags);
	}
	
	function getCharRegExpString(chr)
	{
		var lib = { '9': '\\d', ' ': '\\s', '+': '\\+', '(': '\\(', ')': '\\)', '.': '\\.' };
		return (lib.hasOwnProperty(chr) ? lib[chr] : chr);
	}
	
	function getDigits(value)
	{
		return value.replace(/\D*/g, '');
	}
	
	function checkCharacter(chr, allowed, replace, elem)
	{
		var value = elem.value,
			isSelection = (elem.selectionEnd && elem.selectionEnd - elem.selectionStart > 0);
		
		chr = getReplacedChar(chr, replace);
		
		for (var i in allowed)
		{
			var check = allowed[i].regexp.test(chr);
			if (check)
			{
				if (!isSelection)
				{
					var valueContains = (
						value 
						? (value.match(allowed[i].regexp) ? value.match(allowed[i].regexp).length : 0)
						: 0
					);
					check = (allowed[i].count > valueContains);
				}		
				return check;
			}
		}
		return false;
	}
	
	function getReplacedChar(chr, replace)
	{
		for (var i in replace)
		{
			if (typeof replace[i]['self'] === 'string' && replace[i]['self'] === chr && replace[i]['value'])
				return replace[i]['value'];
		}
		return chr;
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