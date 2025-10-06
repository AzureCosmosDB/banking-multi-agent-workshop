<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Factory;

use s9e\RegexpBuilder\Builder;
use s9e\RegexpBuilder\Input\Bytes as BytesInput;
use s9e\RegexpBuilder\Output\Bytes as BytesOutput;

class RawBytes implements FactoryInterface
{
	public static function getBuilder(): Builder
	{
		return new Builder(
			input:  new BytesInput,
			output: new BytesOutput
		);
	}
}