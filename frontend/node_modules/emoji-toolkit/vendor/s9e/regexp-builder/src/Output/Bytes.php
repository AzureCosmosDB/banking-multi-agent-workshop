<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Output;

use function chr;

class Bytes extends AbstractOutput
{
	/** {@inheritdoc} */
	protected int $maxValue = 255;

	/**
	* {@inheritdoc}
	*/
	protected function outputValidValue(int $value): string
	{
		return chr($value);
	}
}