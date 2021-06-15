const {template, types, operator} = require('putout');
const {replaceWith} = operator;
const {isTryStatement, BlockStatement, ContinueStatement} = types;

const buildLog = template(`Zotero.debug('TYPE' + ' ' + 'FILENAME' + '.' + 'NAME')`);
const buildLogEnter = template(`Zotero.debug('enter' + ' ' + 'FILENAME' + '.' + 'NAME' + '(' + JSON.stringify(Array.from(arguments), trace$circularReplacer()) + ')')`);
const buildLogException = template(`Zotero.debug('TYPE' + ' ' + 'FILENAME' + '.' + 'NAME' + ': ' + trace$error.message); throw trace$error`);
const buildTryCatch = template(`try {
        BLOCK;
    } catch(trace$error) {
        CATCH;
    } finally {
        FINALLY;
    }
`);

const JSON = 'JSON';

module.exports.report = () => 'Log events should be used';

module.exports.traverse = ({push}) => ({
    Function(path) {
        const bodyPath = path.get('body');
        
        if (!bodyPath.isBlockStatement())
            return;
        
        if (isTryStatement(bodyPath.node.body[1]))
            return;
        
        push(path);
    }
});

module.exports.FILENAME = ''
module.exports.anonymous = false

module.exports.fix = (path) => {
    const name = getName(path);
    
    if (name) {
      const enterLog = buildLogEnter({
          NAME: name,
          JSON,
          FILENAME: module.exports.FILENAME,
      });
    
      const exitLog = buildLogEvent(name, 'exit');
      const errorLog = buildLogExceptionEvent(name, 'error');
    
      const bodyPath = path.get('body');
      replaceWith(bodyPath, BlockStatement([buildTryCatch({
          BLOCK: path.node.body.body,
          CATCH: errorLog,
          FINALLY: exitLog,
      })]));
    
      bodyPath.node.body.unshift(enterLog);
    }
};

function getName(path) {
    if (path.isClassMethod()) {
        const {name, value} = path.node.key;
        return name || value;
    }

    if (path.isFunctionDeclaration()) {
        return path.node.id.name;
    }

    if (module.exports.anonymous) {
      const {line} = path.node.loc.start;
      return `<anonymous:${line}>`;
    }

    return null
}

function buildLogEvent(name, type) {
    return buildLog({
        NAME: name,
        TYPE: type,
        FILENAME: module.exports.FILENAME,
    });
}
function buildLogExceptionEvent(name, type) {    
    return buildLogException({
        NAME: name,
        TYPE: type,
        FILENAME: module.exports.FILENAME,
    });
}
