<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

use function sprintf;

/**
* @link https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html#sum
*/
class Java extends PrintableAscii
{
	/**
	* {@inheritdoc}
	*/
	protected function escapeControlCode(int $cp): string
	{
		$table = [
			0x07 => '\\a',
			0x09 => '\\t',
			0x0A => '\\n',
			0x0C => '\\f',
			0x0D => '\\r',
			0x1B => '\\e'
		];

		return $table[$cp] ?? $this->escapeAscii($cp);
	}

	/**
	* {@inheritdoc}
	*/
	protected function escapeUnicode(int $cp): string
	{
		$format = ($cp > 0xFFFF) ? '\\x{%' . $this->hexFormat->value . '}' : '\\u%04' . $this->hexFormat->value;

		return sprintf($format, $cp);
	}
}