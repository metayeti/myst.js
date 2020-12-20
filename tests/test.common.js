// test.common.js

///////////////////////////////////////////////////////////////////////////////
//
//  TEST: myst.compose
//
//  Checks if myst.compose() is working properly. Should be tested with older
//  browsers to ensure ES6's Object.Assign is being emulated properly.
//
///////////////////////////////////////////////////////////////////////////////

QUnit.test("myst.compose", function(assert) {

	var composed, expected;

	//
	// compose two objects containing plain values
	//
	composed = myst.compose({
		key: 'value'
	}, {
		0: Infinity
	});
	expected = {
		key: 'value',
		0: Infinity
	};
	assert.deepEqual(composed, expected, "Compose objects containing plain values");

	//
	// compose an object that contains a function
	//
	composed = myst.compose({
		not_important: 'mock data'
	}, {
		foo: function() { return "42" }
	});
	expected = {
		foo: function() { return "42" } // we're only interested in the function
	};
	assert.strictEqual(composed.foo(), expected.foo(), "Compose objects containing functions");

	//
	// compose many key/value pairs
	//
	composed = {};
	expected = {};
	var N = 50;
	for (var i = 0; i < N; i++) {
		var object_key = i;
		var object_value = 'value of ' + i;
		// add using compose
		var to_compose = {};
		to_compose[object_key] = object_value;
		composed = myst.compose(composed, to_compose);
		// add manually
		expected[object_key] = object_value;
	}
	assert.deepEqual(composed, expected, "Compose many key/value pairs");

	//
	// compose nested structures
	//
	composed = myst.compose({
		"nested": {
			"structures": {
				"are": {
					"fun": "...not"
				}
			}
		}
	}, {
		1: {
			2: {
				3: [4, 5, 6]
			}
		}
	});
	expected = {
		"nested": {
			"structures": {
				"are": {
					"fun": "...not"
				}
			}
		},
		1: {
			2: {
				3: [4, 5, 6]
			}
		}
	};
	assert.deepEqual(composed, expected, "Compose nested structures");

	//
	// compose a single empty object
	//
	composed = myst.compose({});
	expected = {};
	assert.deepEqual(composed, expected, "Compose a single empty object");
});
