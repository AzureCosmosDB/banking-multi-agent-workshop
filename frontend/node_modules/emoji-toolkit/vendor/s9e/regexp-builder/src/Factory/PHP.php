<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Factory;

use function str_contains;
use s9e\RegexpBuilder\Builder;
use s9e\RegexpBuilder\Input\Bytes;
use s9e\RegexpBuilder\Input\Utf8;
use s9e\RegexpBuilder\Output\PHP as PHPOutput;

class PHP implements FactoryInterface
{
	public static function getBuilder(string $modifiers = '', string $delimiter = '/'): Builder
	{
		$builder = new Builder(
			input:  str_contains($modifiers, 'u') ? new Utf8 : new Bytes,
			output: new PHPOutput
		);
		$builder->output->setDelimiter($delimiter);

		if (str_contains($modifiers, 'n'))
		{
			$builder->serializer->useNonCapturingGroups = false;
		}
		if (str_contains($modifiers, 'x'))
		{
			$builder->output->enableExtended();
		}

		return $builder;
	}
}