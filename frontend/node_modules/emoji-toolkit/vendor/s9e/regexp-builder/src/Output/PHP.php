<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

use ValueError;
use function ord, preg_match, strlen;

class PHP extends PCRE2
{
	/**
	* Set the delimiter(s) used for the regexp
	*
	* @param  string $delimiter Delimiter character(s)
	* @return void
	*/
	public function setDelimiter(string $delimiter): void
	{
		// https://github.com/php/php-src/blob/bd3cd6a41a0b0adcd1e402b4b0a8497ba2f427f9/ext/pcre/php_pcre.c#L654
		if (preg_match('([\\x00-\\x200-9A-Z\\\\a-z])', $delimiter))
		{
			throw new ValueError('Delimiter must not be alphanumeric, backslash, or NUL');
		}

		$i = strlen($delimiter);
		while (--$i >= 0)
		{
			$chr = $delimiter[$i];
			$cp  = ord($chr);

			$this->bodyMap[$cp]      = '\\' . $chr;
			$this->classAtomMap[$cp] = '\\' . $chr;
		}
	}
}