var path = require('path');

var scripts = require('../../lib/scripts');
var helper = require('../helper');

var assert = helper.assert;
var fixtures = path.join(__dirname, '..', 'fixtures');

describe('scripts', function() {

  describe('Script', function() {

    describe('constructor', function() {
      it('creates a Script instance', function() {
        var s = new scripts.Script({name: 'foo', source: 'bar'});

        assert.instanceOf(s, scripts.Script);
        assert.equal(s.name, 'foo');
        assert.equal(s.source, 'bar');
      });
    });

    describe('#ast_', function() {

      var script;
      before(function(done) {
        scripts.read(path.join(fixtures, 'basic', 'one.js'), function(err, s) {
          script = s;
          done(err);
        });
      });

      it('is the AST', function() {
        var ast = script.ast_;
        assert.equal(ast.type, 'Program');
        assert.lengthOf(ast.body, 5);
      });

      it('resolves to the same AST on multiple calls', function() {
        var ast = script.ast_;
        assert.equal(ast.body[0].type, 'ExpressionStatement');

        var provide = ast.body[0].expression;
        assert.equal(provide.type, 'CallExpression');
        assert.equal(provide.callee.type, 'MemberExpression');
        assert.isFalse(provide.callee.computed);
        assert.isObject(provide.callee.object);
        assert.equal(provide.callee.object.type, 'Identifier');
        assert.equal(provide.callee.object.name, 'goog');
        assert.equal(provide.callee.property.type, 'Identifier');
        assert.equal(provide.callee.property.name, 'provide');

        var args = provide.arguments;
        assert.lengthOf(args, 1);
        assert.equal(args[0].type, 'Literal');
        assert.equal(args[0].value, 'basic.one');
      });

    });

    describe('#provides', function() {
      var script;

      before(function(done) {
        scripts.read(path.join(fixtures, 'basic', 'one.js'), function(err, s) {
          script = s;
          done(err);
        });
      });

      it('is an array of provides', function() {
        assert.deepEqual(script.provides, ['basic.one']);
      });

      it('identifies a valid base file', function(done) {
        scripts.read(path.join(fixtures, 'base', 'valid-base.js'),
            function(err, script) {
              if (err) {
                return done(err);
              }
              assert.deepEqual(script.provides, ['goog']);
              done();
            });
      });

      it('throws on invalid base file', function(done) {
        scripts.read(path.join(fixtures, 'base', 'invalid-base.js'),
            function(err, script) {
              if (err) {
                return done(err);
              }
              assert.throws(function() {
                return script.provides;
              });
              done();
            });
      });

    });

    describe('#requires', function() {
      var script;

      before(function(done) {
        scripts.read(path.join(fixtures, 'basic', 'one.js'), function(err, s) {
          script = s;
          done(err);
        });
      });

      it('is an array of requires', function() {
        assert.deepEqual(script.requires,
            ['goog.array', 'goog.array.ArrayLike']);
      });

    });

  });

  describe('read', function() {

    it('returns a promise that resolves to a script', function(done) {
      scripts.read(path.join(fixtures, 'basic', 'one.js'),
          function(err, script) {
            if (err) {
              return done(err);
            }
            assert.instanceOf(script, scripts.Script);
            done();
          });
    });

    it('returns a rejected promise for bogus path', function(done) {
      scripts.read('bogus path', function(err, script) {
        if (script) {
          return done(new Error('Bogus path should not resolve to a script'));
        }
        // success
        done();
      });
    });

  });

});