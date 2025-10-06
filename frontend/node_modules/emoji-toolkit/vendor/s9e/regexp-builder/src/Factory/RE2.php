<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Factory;

use s9e\RegexpBuilder\Builder;
use s9e\RegexpBuilder\Input\Utf8;
use s9e\RegexpBuilder\Output\RE2 as RE2Output;

class RE2 implements FactoryInterface
{
	public static function getBuilder(): Builder
	{
		return new Builder(
			input:  new Utf8,
			output: new RE2Output
		);
	}
}