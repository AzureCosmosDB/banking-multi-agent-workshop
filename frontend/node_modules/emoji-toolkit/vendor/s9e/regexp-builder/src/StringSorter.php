<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder;

use function array_values, count, usort;

class StringSorter
{
	/**
	* Deduplicate, sort, and return a given list of strings
	*
	* @param  array<int, int[]> $strings Original strings, passed as lists of values
	* @return array<int, int[]>
	*/
	public function getUniqueSortedStrings(array $strings): array
	{
		// Sort
		usort($strings, $this->compareStrings(...));

		// Deduplicate
		$i = count($strings);
		while (--$i > 0)
		{
			if ($strings[$i] === $strings[$i - 1])
			{
				unset($strings[$i]);
			}
		}

		// Re-index
		return array_values($strings);
	}

	/**
	* @param  int[] $a
	* @param  int[] $b
	* @return int
	*/
	protected function compareStrings(array $a, array $b): int
	{
		$i = -1;
		while (isset($a[++$i]))
		{
			if (!isset($b[$i]))
			{
				// If $a is longer than $b it should follow it
				return 1;
			}
			if ($a[$i] !== $b[$i])
			{
				// If either value represents a meta expression, sort them in descending order so
				// that literals appear before meta expressions, otherwise sort them in ascending
				// lexicographical order
				return ($a[$i] < 0 || $b[$i] < 0) ? $b[$i] - $a[$i] : $a[$i] - $b[$i];
			}
		}

		// $a is shorter than (or identical to) $b and should precede it
		return -1;
	}
}