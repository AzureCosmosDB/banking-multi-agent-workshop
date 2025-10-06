<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Factory;

use function str_contains;
use s9e\RegexpBuilder\Builder;
use s9e\RegexpBuilder\Input\Utf8;
use s9e\RegexpBuilder\Output\JavaScript as JavaScriptOutput;

class JavaScript implements FactoryInterface
{
	public static function getBuilder(string $flags = ''): Builder
	{
		$builder = new Builder(
			input:  new Utf8,
			output: new JavaScriptOutput
		);
		$builder->input->useSurrogates = !str_contains($flags, 'u');

		return $builder;
	}
}