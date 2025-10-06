<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

use function sprintf;

/**
* @link https://github.com/google/re2/wiki/Syntax
*/
class RE2 extends PrintableAscii
{
	/**
	* {@inheritdoc}
	*/
	protected function escapeControlCode(int $cp): string
	{
		$table = [
			007 => '\\a',
			011 => '\\t',
			012 => '\\n',
			013 => '\\v',
			014 => '\\f',
			015 => '\\r'
		];

		return $table[$cp] ?? $this->escapeAscii($cp);
	}

	/**
	* {@inheritdoc}
	*/
	protected function escapeUnicode(int $cp): string
	{
		return sprintf('\\x{%04' . $this->hexFormat->value . '}', $cp);
	}
}