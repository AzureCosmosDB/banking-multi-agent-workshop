<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

interface OutputInterface
{
	/**
	* Serialize a value into a character used in given context
	*
	* @param  int     $value
	* @param  Context $context
	* @return string
	*/
	public function output(int $value, Context $context): string;
}