<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder\Factory;

use s9e\RegexpBuilder\Builder;

interface FactoryInterface
{
	public static function getBuilder(): Builder;
}