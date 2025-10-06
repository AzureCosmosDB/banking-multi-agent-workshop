<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Input;

use ValueError;
use function array_map, ord, preg_match_all;

class Utf8 implements InputInterface
{
	/**
	* @var bool Whether to use surrogates to represent higher codepoints
	*/
	public bool $useSurrogates = false;

	/**
	* {@inheritdoc}
	*/
	public function split(string $string): array
	{
		if (preg_match_all('(.)us', $string, $matches) === false)
		{
			throw new ValueError('Invalid UTF-8 string');
		}

		return ($this->useSurrogates) ? $this->charsToCodepointsWithSurrogates($matches[0]) : $this->charsToCodepoints($matches[0]);
	}

	/**
	* Convert a list of UTF-8 characters into a list of Unicode codepoint
	*
	* @param  string[]  $chars
	* @return int[]
	*/
	protected function charsToCodepoints(array $chars): array
	{
		return array_map($this->cp(...), $chars);
	}

	/**
	* Convert a list of UTF-8 characters into a list of Unicode codepoint with surrogates
	*
	* @param  string[]  $chars
	* @return int[]
	*/
	protected function charsToCodepointsWithSurrogates(array $chars): array
	{
		$codepoints = [];
		foreach ($chars as $char)
		{
			$cp = $this->cp($char);
			if ($cp < 0x10000)
			{
				$codepoints[] = $cp;
			}
			else
			{
				$codepoints[] = 0xD7C0 + ($cp >> 10);
				$codepoints[] = 0xDC00 + ($cp & 0x3FF);
			}
		}

		return $codepoints;
	}

	/**
	* Compute and return the Unicode codepoint for given UTF-8 char
	*
	* @param  string  $char UTF-8 char
	* @return int
	*/
	protected function cp(string $char): int
	{
		$cp = ord($char[0]);
		if ($cp >= 0xF0)
		{
			$cp = ($cp << 18) + (ord($char[1]) << 12) + (ord($char[2]) << 6) + ord($char[3]) - 0x3C82080;
		}
		elseif ($cp >= 0xE0)
		{
			$cp = ($cp << 12) + (ord($char[1]) << 6) + ord($char[2]) - 0xE2080;
		}
		elseif ($cp >= 0xC0)
		{
			$cp = ($cp << 6) + ord($char[1]) - 0x3080;
		}

		return $cp;
	}
}