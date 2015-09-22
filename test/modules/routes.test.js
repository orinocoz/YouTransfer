
// ------------------------------------------------------------------------------------------ Test Dependencies

var _ = require('lodash');
var sinon = require('sinon');
var should = require('chai').should();
var routes = require('../../lib/routes');
var router = routes('./dist');

var nconf = require('nconf');
nconf.argv()
	 .env();
nconf.set('basedir', __dirname);

// ------------------------------------------------------------------------------------------ Mock Dependencies

var fs = require('fs');
var nstatic = require('node-static');
var youtransfer = require('../../lib/youtransfer');

// ------------------------------------------------------------------------------------------ Test Definition

describe('YouTransfer Router module', function() {

	var sandbox;

	// -------------------------------------------------------------------------------------- Test Initialization

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	// -------------------------------------------------------------------------------------- Testing constructor

	it('should accept options by Object', function() {
		var instance = routes({ fileServer: 'My Awesome Fileserver' });
		instance.fileServer.should.equals('My Awesome Fileserver');
	});

	it('should accept options by Null Object', function() {
		var instance = routes(null);
		should.exist(instance.fileServer);
		instance.fileServer.serverInfo.should.equals('node-static/0.7.7');
	});

	it('should accept options by empty Object', function() {
		var instance = routes({});
		should.exist(instance.fileServer);
		instance.fileServer.serverInfo.should.equals('node-static/0.7.7');
	});

	it('should accept options by String', function() {
		var instance = routes('./path');
		should.exist(instance.fileServer);
		instance.fileServer.serverInfo.should.equals('node-static/0.7.7');
	});

	it('should throw an error when setting options by Integer', function() {
		try {
			var instance = routes(100);
			should.not.exist(instance);
		} catch(err) {
			should.exist(err);
			err.should.equals('Invalid options provided');
		}
	});

	// -------------------------------------------------------------------------------------- Testing upload

	it('should be possible to upload without using dropzone', function(done) {
		
		var req = {
			files: {
				payload: 'file'
			},
			params: {
				bundle: 'bundle'
			},
			isXmlHtppRequest: true
		}

		var res = {
			json: function() {},
			render: function() {}
		};

		var context = {
			id: 'token'
		}

		var response = _.assign({
			success: true,
			isPostback: true, 
			link: '/download/' + context.id + '/',
			error: ''
		}, context);

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				baseUrl: ''
			});
		});

		sandbox.stub(youtransfer, 'upload', function (file, bundle, callback) {
			callback(null, context);
		});

		var resMock = sandbox.mock(res);
		resMock.expects("json").once().withArgs(response);

		router.upload()(req, res, function() {
			resMock.verify();
			done();
		});
	});

	it('should be possible to upload using dropzone', function(done) {
		
		var req = {
			files: {
				'dz-payload': 'file'
			},
			params: {
				bundle: 'bundle'
			},
			isXmlHtppRequest: true
		}

		var res = {
			json: function() {},
			render: function() {}
		};

		var context = {
			id: 'token'
		}

		var response = _.assign({
			success: true,
			isPostback: true, 
			link: '/download/' + context.id + '/',
			error: ''
		}, context);

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				baseUrl: ''
			});
		});

		sandbox.stub(youtransfer, 'upload', function (file, bundle, callback) {
			callback(null, context);
		});

		var resMock = sandbox.mock(res);
		resMock.expects("json").once().withArgs(response);

		router.upload()(req, res, function() {
			resMock.verify();
			done();
		});
	});

	it('should provide feedback if errors occur while uploading', function(done) {
		
		var req = {
			files: {
				payload: 'file'
			},
			params: {
				bundle: 'bundle'
			},
			isXmlHtppRequest: true
		}

		var res = {
			json: function() {},
			render: function() {}
		};

		var context = {
			id: 'token'
		}

		var response = _.assign({
			success: false,
			isPostback: true, 
			link: '/download/' + context.id + '/',
			error: 'this is an error'
		}, context);

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				baseUrl: ''
			});
		});

		sandbox.stub(youtransfer, 'upload', function (file, bundle, callback) {
			callback(new Error(response.error), context);
		});

		var resMock = sandbox.mock(res);
		resMock.expects("json").once().withArgs(response);

		router.upload()(req, res, function() {
			resMock.verify();
			done();
		});
	});	

	it('should return the index page after uploading if not using XmlHtppRequest', function(done) {
		
		var req = {
			files: {
				payload: 'file'
			},
			params: {
				bundle: 'bundle'
			},
			isXmlHtppRequest: false
		}

		var res = {
			json: function() {},
			render: function() {}
		};

		var context = {
			id: 'token'
		}

		var response = _.assign({
			success: false,
			isPostback: true, 
			link: '/download/' + context.id + '/',
			error: 'this is an error'
		}, context);

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				baseUrl: ''
			});
		});

		sandbox.stub(youtransfer, 'upload', function (file, bundle, callback) {
			callback(new Error(response.error), context);
		});

		var resMock = sandbox.mock(res);
		resMock.expects("render").once().withArgs("index.html", response);

		router.upload()(req, res, function() {
			resMock.verify();
			done();
		});
	});		

	// -------------------------------------------------------------------------------------- Testing uploadBundle

	it('should be possible to upload bundle', function(done) {

		var req = {
			params: {
				bundle: JSON.stringify({
					id: 'bundle'
				})
			},
			isXmlHtppRequest: true
		}

		var res = {
			json: function() {},
			render: function() {}
		};

		var response = {
			success: true,
			isPostback: true, 
			error: ''
		}

		sandbox.stub(youtransfer, 'bundle', function (bundle, callback) {
			callback(null);
		});

		var resMock = sandbox.mock(res);
		resMock.expects("json").once().withArgs(response);

		router.uploadBundle()(req, res, function() {
			resMock.verify();
			done();
		})

	});

	it('should provide feedback if errors occur while uploading bundle', function(done) {

		var req = {
			params: {
				bundle: JSON.stringify({
					id: 'bundle'
				})
			},
			isXmlHtppRequest: true
		}

		var res = {
			json: function() {},
			render: function() {}
		};

		var response = {
			success: false,
			isPostback: true, 
			error: 'this is an error message'
		}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				baseUrl: ''
			});
		});

		sandbox.stub(youtransfer, 'bundle', function (bundle, callback) {
			callback(new Error(response.error));
		});

		var resMock = sandbox.mock(res);
		resMock.expects("json").once().withArgs(response);

		router.uploadBundle()(req, res, function() {
			resMock.verify();
			done();
		});

	});

	it('should return the index page after uploading bundle if not using XmlHtppRequest', function(done) {

		var req = {
			params: {
				bundle: JSON.stringify({
					id: 'bundle'
				})
			},
			isXmlHtppRequest: false
		}

		var res = {
			json: function() {},
			render: function() {}
		};

		var response = {
			success: true,
			isPostback: true, 
			error: ''
		}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				baseUrl: ''
			});
		});

		sandbox.stub(youtransfer, 'bundle', function (bundle, callback) {
			callback(null);
		});

		var resMock = sandbox.mock(res);
		resMock.expects("render").once().withArgs('index.html', response);

		router.uploadBundle()(req, res, function() {
			resMock.verify();
			done();
		});

	});

	// -------------------------------------------------------------------------------------- Testing send

	it('should be possible to send an email', function() {
		var req = {},
			res = {
				redirect: function() {}
			}

		sandbox.stub(youtransfer, 'send', function (req, res, callback) {
			callback();
		});

		var resMock = sandbox.mock(res);
		resMock.expects("redirect").once().withArgs('/');

		router.send()(req, res);
		resMock.verify();
	});

	// -------------------------------------------------------------------------------------- Testing downloadFile

	it('should be possible to download a file', function() {
		var req = {
				params: {
					token: 'token'
				}
			},
			res = {
				redirect: function() {}
			}

		sandbox.stub(youtransfer, 'download', function (token, res, callback) {
			should.exist(token);
			token.should.equals(req.params.token);
			callback();
		});

		var resMock = sandbox.mock(res);
		resMock.expects("redirect").once().withArgs('/');

		router.downloadFile()(req, res);
		resMock.verify();
	});

	// -------------------------------------------------------------------------------------- Testing downloadBundle

	it('should be possible to download a bundle', function() {
		var req = {
				params: {
					token: 'token'
				}
			},
			res = {
				redirect: function() {}
			}

		sandbox.stub(youtransfer, 'archive', function (token, res, callback) {
			should.exist(token);
			token.should.equals(req.params.token);
			callback();
		});

		var resMock = sandbox.mock(res);
		resMock.expects("redirect").once().withArgs('/');

		router.downloadBundle()(req, res);
		resMock.verify();
	});

	// -------------------------------------------------------------------------------------- Testing settingsRedirect

	it('should redirect to general settings page if no page is specified', function() {
		var req = {},
			res = {
				redirect: function() {}
			}

		var resMock = sandbox.mock(res);
		resMock.expects("redirect").once().withArgs('/settings/general');

		router.settingsRedirect()(req, res);
		resMock.verify();
	});

	// -------------------------------------------------------------------------------------- Testing settingsFinalise

	it('should be possible to finalise settings', function() {
		var req = {},
			res = {
				redirect: function() {}
			}

		sandbox.stub(youtransfer.settings, 'push', function (settings, callback) {
			should.exist(settings);
			settings.finalised.should.equals(true);
			callback();
		});

		var resMock = sandbox.mock(res);
		resMock.expects("redirect").once().withArgs('/');

		router.settingsFinalise()(req, res);
		resMock.verify();
	});

	// -------------------------------------------------------------------------------------- Testing settingsGetTemplateByName

	it('should be possible to get template source', function(done) {

		var req = {
				params: {
					name: 'template'
				}
			},
			res = {
				setHeader: function() {},
				send: function() {},
				end: function() {}
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: false
			});
		});

		sandbox.stub(fs, 'readFile', function (file, encoding, callback) {
			callback(null, 'source');
		});

		var resMock = sandbox.mock(res);
		resMock.expects('setHeader').once().withArgs('Content-Type', 'text/html');
		resMock.expects('setHeader').once().withArgs('Cache-Control', 'private, max-age=0, proxy-revalidate, no-store, no-cache, must-revalidate');
		resMock.expects('send').once().withArgs('source');
		resMock.expects('end').once();

		router.settingsGetTemplateByName()(req, res, function() {
			resMock.verify();
			done();
		})
	});

	it('should not be possible to get template source if settings are finalised', function(done) {

		var req = {
				params: {
					name: 'template'
				}
			},
			res = {
				json: function() {}
			},
			response = {
				success: false, 
				err: 'The settings have been finalised and cannot be modified'
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: true
			});
		});

		var resMock = sandbox.mock(res);
		resMock.expects('json').once().withArgs(response);

		router.settingsGetTemplateByName()(req, res, function() {
			resMock.verify();
			done();
		})
	});	

	it('should provide feedback if an error occures while trying to read template source', function(done) {

		var req = {
				params: {
					name: 'template'
				}
			},
			res = {
				json: function() {}
			},
			response = { 
				success: false, 
				err: 'error' 
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: false
			});
		});

		sandbox.stub(fs, 'readFile', function (file, encoding, callback) {
			callback(new Error(response.err), null);
		});

		var resMock = sandbox.mock(res);
		resMock.expects('json').once().withArgs(response);

		router.settingsGetTemplateByName()(req, res, function() {
			resMock.verify();
			done();
		})
	});	

	it('should provide feedback if template does not exist', function(done) {

		var req = {
				params: {}
			},
			res = {
				json: function() {}
			},
			response = { 
				success: false, 
				err: 'template not found' 
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: false
			});
		});

		var resMock = sandbox.mock(res);
		resMock.expects('json').once().withArgs(response);

		router.settingsGetTemplateByName()(req, res, function() {
			resMock.verify();
			done();
		})
	});	

	// -------------------------------------------------------------------------------------- Testing settingsSaveTemplate

	it('should be possible to set template source', function(done) {

		var req = {
				params: {
					template: 'template',
					body: 'this is my template'
				}
			},
			res = {
				json: function() {}
			},
			response = {
				success: true,
				isPostback: true,
				template: req.params.template
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: false
			});
		});

		sandbox.stub(fs, 'writeFile', function (file, data, encoding, callback) {
			callback(null);
		});

		var resMock = sandbox.mock(res);
		resMock.expects('json').once().withArgs(response);

		router.settingsSaveTemplate()(req, res, function() {
			resMock.verify();
			done();
		});
	});

	it('should not be possible to set template source if settings have been finalised', function(done) {

		var req = {
				params: {
					body: 'this is my template'
				}
			},
			res = {
				json: function() {}
			},
			response = {
				success: false,
				err: 'The settings have been finalised and cannot be modified'
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: true
			});
		});

		var resMock = sandbox.mock(res);
		resMock.expects('json').once().withArgs(response);

		router.settingsSaveTemplate()(req, res, function() {
			resMock.verify();
			done();
		});
	});

	it('should not be possible to set template source if settings have been finalised', function(done) {

		var req = {
				params: {
					body: 'this is my template'
				}
			},
			res = {
				json: function() {}
			},
			response = {
				success: false,
				isPostback: true,
				template: req.params.template,
				err: 'Invalid template provided'
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: false
			});
		});

		var resMock = sandbox.mock(res);
		resMock.expects('json').once().withArgs(response);

		router.settingsSaveTemplate()(req, res, function() {
			resMock.verify();
			done();
		});
	});

	// -------------------------------------------------------------------------------------- Testing settingsGetByName

	it('should be possible to retrieve settings pages', function(done) {

		var req = {
				params: {
					name: 'general'
				}
			},
			res = {
				render: function() {}
			},
			response = {
				activeTab: req.params.name
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {});
		});

		var resMock = sandbox.mock(res);
		resMock.expects('render').once().withArgs('settings.' + req.params.name + '.html', response);

		router.settingsGetByName()(req, res, function() {
			resMock.verify();
			done();
		});
	});

	it('should be possible to retrieve general settings page if no specific page was provided', function(done) {

		var req = {
				params: {}
			},
			res = {
				render: function() {}
			},
			response = {
				activeTab: 'general'
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {});
		});

		var resMock = sandbox.mock(res);
		resMock.expects('render').once().withArgs('settings.general.html', response);

		router.settingsGetByName()(req, res, function() {
			resMock.verify();
			done();
		});
	});	

	it('should be possible to retrieve dropzone settings', function(done) {

		var req = {
				params: {
					name: 'dropzone'
				},
				isXmlHtppRequest: true
			},
			res = {
				json: function() {}
			},
			response = {}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, response);
		});

		var resMock = sandbox.mock(res);
		resMock.expects('json').once().withArgs(response);

		router.settingsGetByName()(req, res, function() {
			resMock.verify();
			done();
		});
	});	

	it('should not be possible to retrieve settings pages if settings have been finalised', function(done) {

		var req = {
				params: {
					name: 'general'
				}
			},
			res = {
				render: function() {}
			}

		sandbox.stub(youtransfer.settings, 'get', function (callback) {
			callback(null, {
				finalised: true
			});
		});

		var resMock = sandbox.mock(res);
		resMock.expects('render').once().withArgs('404.html');

		router.settingsGetByName()(req, res, function() {
			resMock.verify();
			done();
		});
	});	

	// -------------------------------------------------------------------------------------- Testing settingsSaveByName

	it('should be possible to save settings by name', function(done) {

		var req = {
				params: {
					name: 'general',
					settings: {}
				}
			},
			res = {
				render: function() {}
			},
			response = {
				activeTab: req.params.name
			}

		sandbox.stub(youtransfer.settings, 'push', function (settings, callback) {
			should.exist(settings);
			settings.should.equals(req.params.settings);
			callback(null);
		});

		router.settingsSaveByName()(req, res, function() {
			done();
		});

	});

	// -------------------------------------------------------------------------------------- Testing settingsSaveByName

	it('should be possible to serve static files', function() {

		var res = {},
			req = {
				params: new Array('some', 'static', 'file')
			},
			server = {
				serveFile: function() {}
			}
			instance = new routes({
				fileServer: server
			});

		var serverMock = sandbox.mock(server);
		serverMock.expects('serveFile').once().withArgs('/' + req.params[1] + '/' + req.params[2], 200, { server: 'youtransfer.io', 'Cache-Control': 'max-age=' + nconf.get('CACHE_MAX_AGE') }, req, res);

		instance.staticFiles()(req, res);
		serverMock.verify();
	});

	// -------------------------------------------------------------------------------------- Testing defalt routes

	it('should be possible to retrieve a page', function() {

		var res = {
				setHeader: function() {},
				render: function() {}
			},
			req = {
				params: new Array('index')
			};

		var resMock = sandbox.mock(res);
		resMock.expects('setHeader').once().withArgs('Cache-Control', 'private, max-age=0, proxy-revalidate, no-store, no-cache, must-revalidate');
		resMock.expects('render').once().withArgs(req.params[0] + '.html');

		router.default()(req, res);
		resMock.verify();
	});

	it('should be possible to retrieve index page if no specific page was requested', function() {

		var res = {
				setHeader: function() {},
				render: function() {}
			},
			req = {
				params: {}
			}

		var resMock = sandbox.mock(res);
		resMock.expects('setHeader').once().withArgs('Cache-Control', 'private, max-age=0, proxy-revalidate, no-store, no-cache, must-revalidate');
		resMock.expects('render').once().withArgs('index.html');

		router.default()(req, res);
		resMock.verify();
	});	

});