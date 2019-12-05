
let Index = 0;

function deepEach(rootNode) {
    const obj = {};

    function main(node, parent, col) {
        const key = (parent === '' ? '' : (parent + '_')) + col;

        obj[key] = node;

        if (node.children && node.children.length > 0) {
            node.children.forEach((item, index) => {
                main(item, key, index)
            });
        }
    }

    main(rootNode, '', 0);

    return obj;
}


const catchMap = {};

function levenshteinDistance(str1, str2) {
    let num = 0;
    let len1 = str1.length;
    let len2 = str2.length;

    if (catchMap[len1 + '_' + len2]) {
        return catchMap[len1 + '_' + len2];
    }

    if (str1 === str2) {
        num = 0;
    } else {
        if (str1 === undefined || str2 === undefined || len1 === 0 || len2 === 0) {
            num = Math.max(len1, len2);
        } else {
            if (str1[len1 - 1] === str2[len2 - 1]) {
                num = levenshteinDistance(str1.substr(0, len1 - 1), str2.substr(0, len2 - 1));
            } else {
                num = Math.min(
                    levenshteinDistance(str1.substr(0, len1 - 1), str2),
                    levenshteinDistance(str1.substr(0, len1 - 1), str2.substr(0, len2 - 1)),
                    levenshteinDistance(str1, str2.substr(0, len2 - 1))
                ) + 1;
            }
        }
    }
    catchMap[len1 + '_' + len2] = num;

    return num;
}


function walk(oldNode, newNode, index, patches) {
    // 比较新旧节点
    patches[index] = [...(patches[index] || [])];

    if (newNode === undefined) {
        patches[index].push({
            type: 'DELETE',
            oldNode: oldNode
        });
    } else if (oldNode.tagName === newNode.tagName) {
        if (oldNode.tagName === undefined) {
            if (oldNode.text !== newNode.text) {
                patches[index].push({
                    type: 'TEXT',
                    oldNode: oldNode,
                    newNode: newNode
                });
            }
        } else {
            /* patches[index].push({
                type: 'PROPS',
                props: {
                    ...newNode.attr
                }
            }); */

            diffChildren(oldNode.children || [], newNode.children || [], index, patches);
        }
    } else {
        patches[index].push({
            type: 'REPLACE',
            oldNode: oldNode,
            newNode: newNode
        });
    }

    /* if (patches[index].length === 0) {
        delete patches[index];
    } */

    return patches
}

function diffChildren(oldChildren, newChildren, index, patches) {
    let prevNode = null;
    let currentIndex = index;

    oldChildren.forEach((child, i) => {
        currentIndex = (prevNode && prevNode.count) ? (prevNode.count + currentIndex + 1) : (currentIndex + 1);
        walk(child, newChildren[i], currentIndex, patches);
        prevNode = child;
    });

    if (oldChildren.length < newChildren.length) {
        newChildren.slice(oldChildren.length, newChildren.length).forEach(item => {
            patches[oldChildren[oldChildren.length - 1].count].push({
                type: 'ADD',
                prevNode: oldChildren[oldChildren.length - 1],
                node: item
            });
            // walk(undefined, newChildren[i], oldChildren[oldChildren.length - 1].count, patches);
        });
    }
}

export default function diff(oldVertualDom, newVertualDom) {
    let patches = {}
    let Index = 0;

    walk(oldVertualDom, newVertualDom, Index, patches);

    return patches;
}


export function updateDom(patches) {
    Object.keys(patches).forEach(key => {
        patches[key].forEach(item => {
            if (item.type === 'TEXT') {
                // 更新文本
                item.oldNode.elm.textContent = item.newNode.text;
            } else if (item.type === 'DELETE') {
                // 更新文本
                item.oldNode.elm.parentNode.removeChild(item.oldNode.elm);
            } else if (item.type === 'REPLACE') {
                item.oldNode.elm.parentNode.replaceChild(item.newNode.render(), item.oldNode.elm);
                //item.oldNode.
            } else if (item.type === 'ADD') {
                // oldVDomMap[key].elm.parentNode.replaceChild(newVDomMap[key].render(), oldVDomMap[key].elm);
            }
        });
    });
}