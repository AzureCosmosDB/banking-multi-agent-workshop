<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Input;

use function array_map, str_split;

class Bytes implements InputInterface
{
	/**
	* {@inheritdoc}
	*/
	public function split(string $string): array
	{
		if ($string === '')
		{
			return [];
		}

		return array_map('ord', str_split($string, 1));
	}
}