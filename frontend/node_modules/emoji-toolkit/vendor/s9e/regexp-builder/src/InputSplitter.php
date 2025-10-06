<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder;

use s9e\RegexpBuilder\Input\InputInterface;
use const PREG_OFFSET_CAPTURE;
use function array_map, array_keys, preg_match_all, implode, substr, strlen, usort;

class InputSplitter
{
	/**
	* @var array<int|string, int> $map
	*/
	protected array $map;

	/**
	* @var string $regexp Regexp that matches meta sequences
	*/
	protected string $regexp;

	public function __construct(
		public InputInterface $input,
		public Meta           $meta
	)
	{
	}

	/**
	* Split a list of strings into numeric values
	*
	* @param  string[] $strings
	* @return int[][]
	*/
	public function splitStrings(array $strings): array
	{
		$this->map    = $this->meta->getInputMap();
		$this->regexp = $this->getInputRegexp(array_map('strval', array_keys($this->map)));

		return array_map($this->splitString(...), $strings);
	}

	/**
	* Split given literal and add it to the list of values
	*
	* @param int[] &$return
	* @param string $string
	*/
	protected function addLiteral(array &$return, string $string): void
	{
		foreach ($this->input->split($string) as $value)
		{
			$return[] = $value;
		}
	}

	/**
	* Generate and return the regexp used to match all given meta sequences
	*
	* @param  array<int, string> $sequences
	* @return string
	*/
	protected function getInputRegexp(array $sequences): string
	{
		if (empty($sequences))
		{
			return '((?!))';
		}

		// Sort by length descending, then lexicographical order ascending
		usort($sequences, fn($a, $b) => (strlen($b) - strlen($a)) ?: $b <=> $a);

		return '(' . implode('|', array_map('preg_quote', $sequences)) . ')';
	}

	/**
	* Get all matches from meta expressions from given string
	*
	* @param  string $string
	* @return array<int, string> Position as key, match as value
	*/
	protected function getMatches(string $string): array
	{
		preg_match_all($this->regexp, $string, $m, PREG_OFFSET_CAPTURE);

		$matches = [];
		foreach ($m[0] as [$match, $matchPos])
		{
			$matches[(int) $matchPos] = $match;
		}

		return $matches;
	}

	/**
	* Split given string into a list of values
	*
	* @param  string $string
	* @return int[]
	*/
	protected function splitString(string $string): array
	{
		$matches = $this->getMatches($string);

		$lastPos = 0;
		$return  = [];
		foreach ($matches as $matchPos => $match)
		{
			if ($matchPos > $lastPos)
			{
				$this->addLiteral($return, substr($string, $lastPos, $matchPos - $lastPos));
			}
			$return[] = $this->map[$match];
			$lastPos  = $matchPos + strlen($match);
		}
		$this->addLiteral($return, substr($string, $lastPos));

		return $return;
	}
}