<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder;

use ValueError;
use const false, true;
use function array_search, count, ord, preg_last_error_msg, preg_match;

class Meta
{
	/**
	* @const Bit value that indicates whether a meta sequence represents a single character usable
	*        in a character class
	*/
	final protected const IS_CHAR = 1;

	/**
	* @const Bit value that indicates whether a meta sequence represents a quantifiable expression
	*/
	final protected const IS_QUANTIFIABLE = 2;

	/**
	* @var array<int|string, int> Map of meta sequences and their numeric values
	*/
	protected array $inputMap = [];

	/**
	* @var array<int, string> Map of meta values and the expressions they represent
	*/
	protected array $outputMap = [];

	/**
	* @param iterable $map Map of sequences and the expressions they represent
	*/
	public function __construct(iterable $map = [])
	{
		foreach ($map as $sequence => $expression)
		{
			$this->set((string) $sequence, $expression);
		}
	}

	/**
	* Return the expression that matches given value
	*
	* @param  int $value
	* @return string
	*/
	public function getExpression(int $value): string
	{
		return $this->outputMap[$value];
	}

	/**
	* @return array<int|string, int>
	*/
	public function getInputMap(): array
	{
		return $this->inputMap;
	}

	/**
	* Return whether a given value represents a single character usable in a character class
	*
	* @param  int  $value
	* @return bool
	*/
	public static function isChar(int $value): bool
	{
		return ($value >= 0 || ($value & self::IS_CHAR));
	}

	/**
	* Return whether a given value represents a quantifiable expression
	*
	* @param  int  $value
	* @return bool
	*/
	public static function isQuantifiable(int $value): bool
	{
		return ($value >= 0 || ($value & self::IS_QUANTIFIABLE));
	}

	/**
	* Set a meta sequence
	*
	* @param  string $sequence   String used in the input
	* @param  string $expression Regular expression used in the output
	* @return void
	*/
	public function set(string $sequence, string $expression): void
	{
		if (@preg_match('(' . $expression . ')u', '') === false)
		{
			throw new ValueError("Invalid expression '" . $expression . "' (" . preg_last_error_msg() . ')');
		}

		// Map to the same value if possible, create a new one otherwise
		$value = array_search($expression, $this->outputMap, true);
		if ($value === false)
		{
			$value = $this->computeValue($expression);
		}

		$this->inputMap[$sequence] = $value;
		$this->outputMap[$value]   = $expression;
	}

	/**
	* Compute and return a value for given expression
	*
	* Values are meant to be a unique negative integer. The least significant bits are used to
	* store the expression's properties
	*
	* @param  string $expr Regular expression
	* @return int
	*/
	protected function computeValue(string $expr): int
	{
		// If the expression is a single digit/letter or an escaped character, return its codepoint
		if (preg_match('(^(?:[0-9A-Za-z]|\\\\[^0-9A-Za-z])$)D', $expr))
		{
			return ord($expr[-1]);
		}

		$properties = [
			self::IS_CHAR         => 'exprIsChar',
			self::IS_QUANTIFIABLE => 'exprIsQuantifiable'
		];
		$value = (1 + count($this->outputMap)) * -(2 ** count($properties));
		foreach ($properties as $bitValue => $methodName)
		{
			if ($this->$methodName($expr))
			{
				$value |= $bitValue;
			}
		}

		return $value;
	}

	/**
	* Test whether given expression represents a single character usable in a character class
	*
	* @param  string $expr
	* @return bool
	*/
	protected function exprIsChar(string $expr): bool
	{
		$regexps = [
			// Escaped literal or escape sequence such as \w but not \R
			'(^\\\\[adefhnrstvwDHNSVW\\W]$)D',

			// Unicode properties such as \pL or \p{Lu}
			'(^\\\\p(?:.|\\{[^}]+\\})$)Di',

			// An escape sequence such as \x1F or \x{2600}
			'(^\\\\x(?:[0-9a-f]{2}|\\{[^}]+\\})$)Di'
		];

		return $this->matchesAny($expr, $regexps);
	}

	/**
	* Test whether given expression is quantifiable
	*
	* @param  string $expr
	* @return bool
	*/
	protected function exprIsQuantifiable(string $expr): bool
	{
		$regexps = [
			// A dot or \R
			'(^(?:\\.|\\\\R)$)D',

			// A character class
			'(^\\[\\^?(?:([^\\\\\\]]|\\\\.)(?:-(?-1))?)++\\]$)D'
		];

		return $this->matchesAny($expr, $regexps) || $this->exprIsChar($expr);
	}

	/**
	* Test whether given expression matches any of the given regexps
	*
	* @param  string             $expr
	* @param  array<int, string> $regexps
	* @return bool
	*/
	protected function matchesAny(string $expr, array $regexps): bool
	{
		foreach ($regexps as $regexp)
		{
			if (preg_match($regexp, $expr))
			{
				return true;
			}
		}

		return false;
	}
}