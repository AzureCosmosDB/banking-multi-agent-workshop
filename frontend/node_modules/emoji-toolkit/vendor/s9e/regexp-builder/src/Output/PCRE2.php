<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

use function sprintf;

/**
* @link https://pcre.org/current/doc/html/pcre2syntax.html#SEC3
*/
class PCRE2 extends PrintableAscii
{
	/**
	* Enable PCRE2_EXTENDED option
	*/
	public function enableExtended(): void
	{
		// LF and other control codes are already escaped, so is Unicode whitespace
		$this->bodyMap[32] = '\\ ';
		$this->bodyMap[35] = '\\#';
	}

	/**
	* Enable PCRE2_EXTENDED_MORE option
	*/
	public function enableExtendedMore(): void
	{
		$this->enableExtended();

		$this->classAtomMap[32] = '\\ ';
		$this->classAtomMap[35] = '\\#';
	}

	/**
	* {@inheritdoc}
	*/
	protected function escapeUnicode(int $cp): string
	{
		return sprintf('\\x{%04' . $this->hexFormat->value . '}', $cp);
	}
}