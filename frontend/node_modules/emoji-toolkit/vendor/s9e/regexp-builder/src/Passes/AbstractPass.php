<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Passes;

use const false, true;
use function array_shift, array_unshift, count, end, is_array;
use s9e\RegexpBuilder\Meta;

abstract class AbstractPass implements PassInterface
{
	/**
	* @var bool Whether the current set of strings is optional
	*/
	protected bool $isOptional;

	/**
	* {@inheritdoc}
	*/
	public function run(array $strings): array
	{
		$strings = $this->beforeRun($strings);
		if ($this->canRun($strings))
		{
			$strings = $this->runPass($strings);
		}
		$strings = $this->afterRun($strings);

		return $strings;
	}

	/**
	* Process the list of strings after the pass is run
	*
	* @param  array[] $strings
	* @return array[]
	*/
	protected function afterRun(array $strings): array
	{
		if ($this->isOptional && $strings[0] !== [])
		{
			array_unshift($strings, []);
		}

		return $strings;
	}

	/**
	* Prepare the list of strings before the pass is run
	*
	* @param  array[] $strings
	* @return array[]
	*/
	protected function beforeRun(array $strings): array
	{
		$this->isOptional = (isset($strings[0]) && $strings[0] === []);
		if ($this->isOptional)
		{
			array_shift($strings);
		}

		return $strings;
	}

	/**
	* Test whether this pass can be run on a given list of strings
	*
	* @param  array[] $strings
	* @return bool
	*/
	protected function canRun(array $strings): bool
	{
		return true;
	}

	/**
	* Run this pass on a list of strings
	*
	* @param  array[] $strings
	* @return array[]
	*/
	abstract protected function runPass(array $strings): array;

	/**
	* Test whether given string has an optional suffix
	*
	* @param  array $string
	* @return bool
	*/
	protected function hasOptionalSuffix(array $string): bool
	{
		$suffix = end($string);

		return (is_array($suffix) && $suffix[0] === []);
	}

	/**
	* Test whether given string contains a single alternation made of single values
	*
	* @param  array $string
	* @return bool
	*/
	protected function isCharacterClassString(array $string): bool
	{
		return ($this->isSingleAlternationString($string) && $this->isSingleCharStringList($string[0]));
	}

	/**
	* Test whether given string contains one single element that is an alternation
	*
	* @param  array $string
	* @return bool
	*/
	protected function isSingleAlternationString(array $string): bool
	{
		return (count($string) === 1 && is_array($string[0]));
	}

	/**
	* Test whether given string contains a single character value
	*
	* @param  array $string
	* @return bool
	*/
	protected function isSingleCharString(array $string): bool
	{
		return (count($string) === 1 && is_int($string[0]) && Meta::isChar($string[0]));
	}

	/**
	* Test whether given list of strings contains nothing but single-char strings
	*
	* @param  array[] $strings
	* @return bool
	*/
	protected function isSingleCharStringList(array $strings): bool
	{
		foreach ($strings as $string)
		{
			if (!$this->isSingleCharString($string))
			{
				return false;
			}
		}

		return true;
	}
}