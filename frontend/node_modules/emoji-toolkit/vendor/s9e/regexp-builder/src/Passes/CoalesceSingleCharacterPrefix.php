<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Passes;

use function array_merge, array_slice, count, is_int, serialize;
use s9e\RegexpBuilder\Meta;

/**
* Replaces (?:ab|bb|c) with (?:[ab]b|c)
*/
class CoalesceSingleCharacterPrefix extends AbstractPass
{
	/**
	* {@inheritdoc}
	*/
	protected function runPass(array $strings): array
	{
		$newStrings = [];
		foreach ($this->getEligibleKeys($strings) as $keys)
		{
			// Create a new string to hold the merged strings and replace the first element with
			// an empty character class
			$newString    = $strings[$keys[0]];
			$newString[0] = [];

			// Fill the character class with the prefix of each string in this group before removing
			// the original string
			foreach ($keys as $key)
			{
				$newString[0][] = [$strings[$key][0]];
				unset($strings[$key]);
			}
			$newStrings[] = $newString;
		}

		return array_merge($newStrings, $strings);
	}

	/**
	* Filter the list of eligible keys and keep those that have at least two matches
	*
	* @param  array[] $eligibleKeys List of lists of keys
	* @return array[]
	*/
	protected function filterEligibleKeys(array $eligibleKeys): array
	{
		$filteredKeys = [];
		foreach ($eligibleKeys as $keys)
		{
			if (count($keys) > 1)
			{
				$filteredKeys[] = $keys;
			}
		}

		return $filteredKeys;
	}

	/**
	* Get a list of keys of strings eligible to be merged together, grouped by suffix
	*
	* @param  array[] $strings
	* @return array[]
	*/
	protected function getEligibleKeys(array $strings): array
	{
		$eligibleKeys = [];
		foreach ($strings as $k => $string)
		{
			if (is_int($string[0]) && isset($string[1]) && Meta::isChar($string[0]))
			{
				$suffix = serialize(array_slice($string, 1));
				$eligibleKeys[$suffix][] = $k;
			}
		}

		return $this->filterEligibleKeys($eligibleKeys);
	}
}