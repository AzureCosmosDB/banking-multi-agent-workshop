<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder;

use function array_diff_key, array_map, array_unshift, array_values, count, implode, is_array, is_int;
use s9e\RegexpBuilder\Output\Context;
use s9e\RegexpBuilder\Output\OutputInterface;

class Serializer
{
	/**
	* @var bool Whether to use (?:) or () for grouping
	*/
	public bool $useNonCapturingGroups = true;

	public function __construct(
		public readonly Meta            $meta,
		public readonly OutputInterface $output
	)
	{
	}

	/**
	* Serialize given strings into a regular expression
	*
	* @param  array[] $strings
	* @param  bool    $groupAlternations Whether alternations should be parenthesized into a group
	* @return string
	*/
	public function serializeStrings(array $strings, bool $groupAlternations = true): string
	{
		$info         = $this->analyzeStrings($strings);
		$alternations = array_map($this->serializeString(...), $info['strings']);
		if (!empty($info['chars']))
		{
			// Prepend the character class to the list of alternations
			array_unshift($alternations, $this->serializeCharacterClass($info['chars']));
		}

		$expr = implode('|', $alternations);
		if ($this->needsParentheses($info, $groupAlternations))
		{
			$expr = ($this->useNonCapturingGroups ? '(?:' : '(') . $expr . ')';
		}

		return $expr . $info['quantifier'];
	}

	/**
	* Analyze given strings to determine how to serialize them
	*
	* The returned array may contains any of the following elements:
	*
	*  - (string) quantifier Either '' or '?'
	*  - (array)  chars      List of values from single-char strings
	*  - (array)  strings    List of multi-char strings
	*
	* @param  array[] $strings
	* @return array
	*/
	protected function analyzeStrings(array $strings): array
	{
		$info = ['alternationsCount' => 0, 'quantifier' => ''];
		if ($strings[0] === [])
		{
			$info['quantifier'] = '?';
			unset($strings[0]);
		}

		$chars = $this->getChars($strings);
		if (count($chars) > 1)
		{
			++$info['alternationsCount'];
			$info['chars'] = array_values($chars);
			$strings       = array_diff_key($strings, $chars);
		}

		$info['strings']            = array_values($strings);
		$info['alternationsCount'] += count($strings);

		return $info;
	}

	/**
	* Return the portion of strings that are composed of a single character
	*
	* @param  array<int, array> $strings
	* @return array<int, int>            String key => value
	*/
	protected function getChars(array $strings): array
	{
		$chars = [];
		foreach ($strings as $k => $string)
		{
			if ($this->isChar($string))
			{
				$chars[$k] = $string[0];
			}
		}

		return $chars;
	}

	/**
	* Get the list of ranges that cover all given values
	*
	* @param  int[]   $values Ordered list of values
	* @return array[]         List of ranges in the form [start, end]
	*/
	protected function getRanges(array $values): array
	{
		$i      = 0;
		$cnt    = count($values);
		$start  = $values[0];
		$end    = $start;
		$ranges = [];
		while (++$i < $cnt)
		{
			if ($values[$i] === $end + 1)
			{
				++$end;
			}
			else
			{
				$ranges[] = [$start, $end];
				$start = $end = $values[$i];
			}
		}
		$ranges[] = [$start, $end];

		return $ranges;
	}

	/**
	* Test whether given string represents a single character
	*
	* @param  array $string
	* @return bool
	*/
	protected function isChar(array $string): bool
	{
		return count($string) === 1 && is_int($string[0]) && $this->meta::isChar($string[0]);
	}

	/**
	* Test whether an expression is quantifiable based on the strings info
	*
	* @param  array $info
	* @return bool
	*/
	protected function isQuantifiable(array $info): bool
	{
		$strings = $info['strings'];

		return empty($strings) || $this->isSingleQuantifiableString($strings);
	}

	/**
	* Test whether a list of strings contains only one single quantifiable string
	*
	* @param  array[] $strings
	* @return bool
	*/
	protected function isSingleQuantifiableString(array $strings): bool
	{
		return count($strings) === 1 && count($strings[0]) === 1 && $this->meta::isQuantifiable($strings[0][0]);
	}

	/**
	* Test whether an expression needs parentheses based on the strings info
	*
	* @param  array $info
	* @param  bool  $groupAlternations Whether alternations should be parenthesized into a group
	* @return bool
	*/
	protected function needsParentheses(array $info, bool $groupAlternations): bool
	{
		return (($groupAlternations  && $info['alternationsCount'] > 1)
		     || ($info['quantifier'] && !$this->isQuantifiable($info)));
	}

	/**
	* Serialize a given list of values into a character class
	*
	* @param  int[]  $values
	* @return string
	*/
	protected function serializeCharacterClass(array $values): string
	{
		$expr = '[';
		foreach ($this->getRanges($values) as list($start, $end))
		{
			$expr .= $this->serializeClassAtom($start);
			if ($end > $start)
			{
				if ($end > $start + 1)
				{
					$expr .= '-';
				}
				$expr .= $this->serializeClassAtom($end);
			}
		}
		$expr .= ']';

		return $expr;
	}

	/**
	* Serialize a given value to be used in a character class
	*
	* @param  int    $value
	* @return string
	*/
	protected function serializeClassAtom(int $value): string
	{
		return $this->serializeValue($value, Context::ClassAtom);
	}

	/**
	* Serialize an element from a string
	*
	* @param  array|int $element
	* @return string
	*/
	protected function serializeElement(array|int $element): string
	{
		return (is_array($element)) ? $this->serializeStrings($element) : $this->serializeLiteral($element);
	}

	/**
	* Serialize a given value to be used as a literal
	*
	* @param  int    $value
	* @return string
	*/
	protected function serializeLiteral(int $value): string
	{
		return $this->serializeValue($value, Context::Body);
	}

	/**
	* Serialize a given string into a regular expression
	*
	* @param  array  $string
	* @return string
	*/
	protected function serializeString(array $string): string
	{
		return implode('', array_map($this->serializeElement(...), $string));
	}

	/**
	* Serialize a given value
	*
	* @param  int     $value
	* @param  Context $context
	* @return string
	*/
	protected function serializeValue(int $value, Context $context): string
	{
		return ($value < 0) ? $this->meta->getExpression($value) : $this->output->output($value, $context);
	}
}