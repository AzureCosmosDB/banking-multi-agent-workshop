<?php declare(strict_types=1);

/**
* @package   s9e\RegexpBuilder
* @copyright Copyright (c) The s9e authors
* @license   https://opensource.org/licenses/mit-license.php The MIT License
*/
namespace s9e\RegexpBuilder;

use function array_map;
use s9e\RegexpBuilder\Input\Bytes as BytesInput;
use s9e\RegexpBuilder\Input\InputInterface;
use s9e\RegexpBuilder\Output\Bytes as BytesOutput;
use s9e\RegexpBuilder\Output\OutputInterface;
use s9e\RegexpBuilder\Passes\CoalesceOptionalStrings;
use s9e\RegexpBuilder\Passes\CoalesceSingleCharacterPrefix;
use s9e\RegexpBuilder\Passes\GroupSingleCharacters;
use s9e\RegexpBuilder\Passes\MergePrefix;
use s9e\RegexpBuilder\Passes\MergeSuffix;
use s9e\RegexpBuilder\Passes\PromoteSingleStrings;
use s9e\RegexpBuilder\Passes\Recurse;

class Builder
{
	public readonly Runner     $runner;
	public readonly Serializer $serializer;

	/**
	* @var bool Whether the expression generated is meant to be used whole. If not, alternations
	*           will be put into a non-capturing group
	*/
	public bool $standalone = true;

	public function __construct(
		public readonly InputInterface  $input  = new BytesInput,
		public readonly Meta            $meta   = new Meta,
		public readonly OutputInterface $output = new BytesOutput
	)
	{
		$this->serializer = new Serializer($this->meta, $this->output);
		$this->setRunner();
	}

	/**
	* Build and return a regular expression that matches all of the given strings
	*
	* @param  string[] $strings Literal strings to be matched
	* @return string            Regular expression (without delimiters)
	*/
	public function build(array $strings): string
	{
		$strings = $this->getInputSplitter()->splitStrings($strings);
		$strings = $this->getStringSorter()->getUniqueSortedStrings($strings);
		if ($this->isEmpty($strings))
		{
			return '';
		}
		$strings = $this->runner->run($strings);

		return $this->serializer->serializeStrings($strings, !$this->standalone);
	}

	protected function getInputSplitter(): InputSplitter
	{
		return new InputSplitter($this->input, $this->meta);
	}

	public function getStringSorter(): StringSorter
	{
		return new StringSorter;
	}

	/**
	* Test whether the list of strings is empty
	*
	* @param  array<array> $strings
	* @return bool
	*/
	protected function isEmpty(array $strings): bool
	{
		return (empty($strings) || $strings === [[]]);
	}

	/**
	* Set the Runner instance $in this->runner
	*
	* @return void
	*/
	protected function setRunner(): void
	{
		$this->runner = new Runner;
		$this->runner->addPass(new MergePrefix);
		$this->runner->addPass(new GroupSingleCharacters);
		$this->runner->addPass(new Recurse($this->runner));
		$this->runner->addPass(new PromoteSingleStrings);
		$this->runner->addPass(new CoalesceOptionalStrings);
		$this->runner->addPass(new MergeSuffix);
		$this->runner->addPass(new CoalesceSingleCharacterPrefix);
	}
}