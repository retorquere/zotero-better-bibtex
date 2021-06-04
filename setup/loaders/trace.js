const {template, types, operator} = require('putout');
const {replaceWith} = operator;
const {isTryStatement, BlockStatement, ContinueStatement} = types;

const buildLog = template(`console.log('TYPE' + ' ' + 'NAME')`);
const buildLogEnter = template(`console.log('enter' + ' ' + 'NAME' + '(' + JSON.stringify(Array.from(arguments)) + ')')`);
const buildLogException = template(`console.log('TYPE' + ' ' + 'NAME' + ': ' + trace$error.message); throw trace$error`);
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

module.exports.fix = (path) => {
    const name = getName(path);
    
    const enterLog = buildLogEnter({
        NAME: name,
        JSON,
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
};

function getName(path) {
    if (path.isClassMethod())
        return path.node.key.name;
    
    if (path.isFunctionDeclaration())
        return path.node.id.name;
    
    const {line} = path.node.loc.start;
    return `<anonymous:${line}>`;
}

function buildLogEvent(name, type) {
    return buildLog({
        NAME: name,
        TYPE: type,
    });
}
function buildLogExceptionEvent(name, type) {    
    return buildLogException({
        NAME: name,
        TYPE: type,
    });
}