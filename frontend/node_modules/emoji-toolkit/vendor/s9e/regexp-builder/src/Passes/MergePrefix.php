<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Passes;

use const false, true;
use function array_slice, end;

/**
* Replaces (?:axx|ayy) with a(?:xx|yy)
*/
class MergePrefix extends AbstractPass
{
	/**
	* {@inheritdoc}
	*/
	protected function runPass(array $strings): array
	{
		$newStrings = [];
		foreach ($this->getStringsByPrefix($strings) as $prefix => $strings)
		{
			$newStrings[] = (isset($strings[1])) ? $this->mergeStrings($strings) : $strings[0];
		}

		return $newStrings;
	}

	/**
	* Return given strings grouped by their first element
	*
	* NOTE: assumes that this pass is run before the first element of any string could be replaced
	*
	* @param  array[] $strings
	* @return array[]
	*/
	protected function getStringsByPrefix(array $strings): array
	{
		$byPrefix = [];
		foreach ($strings as $string)
		{
			$byPrefix[$string[0]][] = $string;
		}

		return $byPrefix;
	}

	/**
	* Merge given strings into a new single string
	*
	* @param  array[] $strings
	* @return array
	*/
	protected function mergeStrings(array $strings): array
	{
		// Compare the first string of the list to the last and find how many elements they have in
		// common. We can skip the strings in between as long as they remain sorted in lexicographic
		// order
		$first  = $strings[0];
		$last   = end($strings);
		$offset = 1;
		while (isset($first[$offset]) && $first[$offset] === $last[$offset])
		{
			++$offset;
		}

		$newString = array_slice($first, 0, $offset);
		foreach ($strings as $string)
		{
			$newString[$offset][] = array_slice($string, $offset);
		}

		return $newString;
	}
}