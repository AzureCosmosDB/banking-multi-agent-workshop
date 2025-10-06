<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

use ValueError;

abstract class AbstractOutput implements OutputInterface
{
	/**
	* @var <int, string>
	*/
	protected array $bodyMap = [
		36 => '\\$',  40 => '\\(',  41 => '\\)',  42 => '\\*',
		43 => '\\+',  46 => '\\.',  63 => '\\?',  91 => '\\[',
		92 => '\\\\', 94 => '\\^', 123 => '\\{', 124 => '\\|'
	];

	/**
	* @var <int, string>
	*/
	protected array $classAtomMap = [45 => '\\-', 92 => '\\\\', 93 => '\\]', 94 => '\\^'];

	/**
	* @var int Upper limit for valid values
	*/
	protected int $maxValue = 0x10FFFF;

	/**
	* @var int Lower limit for valid values
	*/
	protected int $minValue = 0;

	/**
	* {@inheritdoc}
	*/
	public function output(int $value, Context $context): string
	{
		$this->validate($value);
		$map = ($context === $context::ClassAtom) ? $this->classAtomMap : $this->bodyMap;

		return $map[$value] ?? $this->outputValidValue($value);
	}

	/**
	* Validate given value
	*
	* @param  int  $value
	* @return void
	*/
	protected function validate(int $value): void
	{
		if ($value < $this->minValue || $value > $this->maxValue)
		{
			throw new ValueError('Value ' . $value . ' is out of bounds (' . $this->minValue . '..' . $this->maxValue . ')');
		}
	}

	/**
	* Serialize a valid value into a character
	*
	* @param  int    $value
	* @return string
	*/
	abstract protected function outputValidValue(int $value): string;
}