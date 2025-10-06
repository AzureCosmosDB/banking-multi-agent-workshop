# 1.x to 2.0

### Constructor signature

Starting with 2.0, parameter bags (configuration passed as an associative array) have been replaced with named parameters and public APIs. Named parameters are easier to inspect and analyse.

Here is an example of the old, unsupported configuration:

```php
$builder = new s9e\RegexpBuilder\Builder([
	'input'         => 'Utf8',
	'inputOptions'  => ['useSurrogates' => true],
	'output'        => 'JavaScript',
	'outputOptions' => ['case' => 'lower']
]);
```

Here is the same example using the 2.0 API:

```php
$builder = new s9e\RegexpBuilder\Builder(
	input:  new s9e\RegexpBuilder\Input\Utf8,
	output: new s9e\RegexpBuilder\Output\JavaScript
);
$builder->input->useSurrogates = true;
$builder->output->hexFormat = s9e\RegexpBuilder\Output\HexFormat::LowerCase;
```

The same result can be obtained using a factory, which is the recommended way to create an instance. Here we use the JavaScript factory:

```php
$builder = new s9e\RegexpBuilder\Factory\JavaScript::getBuilder();
$builder->output->hexFormat = s9e\RegexpBuilder\Output\HexFormat::LowerCase;
```

### Meta sequences

Old, unsupported:

```php
$builder = new s9e\RegexpBuilder\Builder([
	'meta' => ['*' => '.*']
]);
```

2.0 API:

```php
$builder = new s9e\RegexpBuilder\Builder;
$builder->meta->set('*', '.*');
```
