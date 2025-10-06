<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Input;

interface InputInterface
{
	/**
	* Split given string into a list of values
	*
	* @param  string $string
	* @return int[]
	*/
	public function split(string $string): array;
}