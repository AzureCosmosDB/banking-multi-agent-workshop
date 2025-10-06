<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

use function sprintf;

class JavaScript extends PrintableAscii
{
	public function __construct()
	{
		// Forward slashes must be escaped in body according to ECMA-262
		// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-RegularExpressionChar
		$this->bodyMap[47]      = '\\/';

		// Escaping slashes in classes is optional but safer
		// https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-RegularExpressionClassChar
		$this->classAtomMap[47] = '\\/';
	}

	/**
	* {@inheritdoc}
	*/
	protected function escapeUnicode(int $cp): string
	{
		$format = ($cp > 0xFFFF) ? '\\u{%' . $this->hexFormat->value . '}' : '\\u%04' . $this->hexFormat->value;

		return sprintf($format, $cp);
	}
}