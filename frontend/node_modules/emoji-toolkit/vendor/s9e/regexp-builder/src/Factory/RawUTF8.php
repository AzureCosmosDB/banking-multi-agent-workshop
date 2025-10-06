<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Factory;

use s9e\RegexpBuilder\Builder;
use s9e\RegexpBuilder\Input\Utf8 as Utf8Input;
use s9e\RegexpBuilder\Output\Utf8 as Utf8Output;

class RawUTF8 implements FactoryInterface
{
	public static function getBuilder(): Builder
	{
		return new Builder(
			input:  new Utf8Input,
			output: new Utf8Output
		);
	}
}