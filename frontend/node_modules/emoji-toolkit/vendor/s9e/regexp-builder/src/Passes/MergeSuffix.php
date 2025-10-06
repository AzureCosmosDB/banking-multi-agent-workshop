<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Passes;

use const false, true;
use function array_filter, array_pop, array_unshift, count, end;

/**
* Replaces (?:aax|bbx) with (?:aa|bb)x
*/
class MergeSuffix extends AbstractPass
{
	/**
	* {@inheritdoc}
	*/
	protected function canRun(array $strings): bool
	{
		return (count($strings) > 1 && $this->hasMatchingSuffix($strings));
	}

	/**
	* {@inheritdoc}
	*/
	protected function runPass(array $strings): array
	{
		$newString = [];
		while ($this->hasMatchingSuffix($strings))
		{
			array_unshift($newString, end($strings[0]));
			$strings = $this->pop($strings);
		}
		array_unshift($newString, $strings);

		return [$newString];
	}

	/**
	* Test whether all given strings have the same last element
	*
	* @param  array[] $strings
	* @return bool
	*/
	protected function hasMatchingSuffix(array $strings): bool
	{
		$suffix = end($strings[1]);
		foreach ($strings as $string)
		{
			if (end($string) !== $suffix)
			{
				return false;
			}
		}

		return ($suffix !== false);
	}

	/**
	* Remove the last element of every string
	*
	* @param  array[] $strings Original strings
	* @return array[]          Processed strings
	*/
	protected function pop(array $strings): array
	{
		$cnt = count($strings);
		$i   = $cnt;
		while (--$i >= 0)
		{
			array_pop($strings[$i]);
		}

		// Remove empty elements then prepend one back at the start of the array if applicable
		$strings = array_filter($strings);
		if (count($strings) < $cnt)
		{
			array_unshift($strings, []);
		}

		return $strings;
	}
}