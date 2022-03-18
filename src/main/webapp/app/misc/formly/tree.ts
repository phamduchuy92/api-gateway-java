import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { plainToFlattenObject } from '../util/request-util';
import { createRequestOption } from 'app//core/request/request-util';
import { catchError, filter, map, tap } from 'rxjs/operators';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  children!: TodoItemNode[];
  item!: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item!: string;
  level!: number;
  expandable!: boolean;
}

/**
 * Example for this.to.items
 */
const TREE_DATA = {
  Groceries: {
    'Almond Meal flour': null,
    'Organic eggs': null,
    'Protein Powder': null,
    Fruits: {
      Apple: null,
      Berries: ['Blueberry', 'Raspberry'],
      Orange: null,
    },
  },
  Test: null,
  Reminders: ['Cook dinner', 'Read the Material Design spec', 'Upgrade Application to Angular'],
};

@Component({
  selector: 'jhi-formly-field-tree',
  template: `
    <mat-tree #tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle matTreeNodePadding>
        <button mat-icon-button disabled></button>
        <mat-checkbox
          class="checklist-leaf-node"
          [checked]="checklistSelection.isSelected(node)"
          (change)="todoLeafItemSelectionToggle(node)"
          [disabled]="to.disabled"
          >{{ node.item }}</mat-checkbox
        >
      </mat-tree-node>

      <mat-tree-node *matTreeNodeDef="let node; when: hasNoContent" matTreeNodePadding>
        <button mat-icon-button disabled></button>
        <mat-form-field appearance="fill">
          <mat-label>New item...</mat-label>
          <input matInput #itemValue />
        </mat-form-field>
        <button mat-button (click)="saveNode(node, itemValue.value)">Save</button>
      </mat-tree-node>

      <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding>
        <!-- button error in formly -->
        <button mat-icon-button matTreeNodeToggle [attr.aria-label]="'Toggle ' + node.item" [disabled]="true">
          <mat-icon class="mat-icon-rtl-mirror">
            {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
          </mat-icon>
        </button>
        <mat-checkbox
          [checked]="descendantsAllSelected(node)"
          [indeterminate]="descendantsPartiallySelected(node)"
          (change)="todoItemSelectionToggle(node)"
          [disabled]="to.disabled"
          >{{ node.item }}</mat-checkbox
        >
        <button mat-icon-button (click)="addNewItem(node)" *ngIf="to.isExpandable === true">
          <mat-icon>add</mat-icon>
        </button>
      </mat-tree-node>
    </mat-tree>
  `,
})
export class TreeTypeComponent extends FieldType implements OnInit, OnDestroy, AfterViewChecked {
  defaultOptions = {
    wrappers: ['form-group'],
  };
  @ViewChild('tree') tree!: ElementRef;

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl!: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener!: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource!: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor(private httpClient: HttpClient) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
      if (this.to.isCollapsed === true) {
        this.treeControl.expandAll();
      }
    });
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.treeControl.expand(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
    this.parseSelected(this.checklistSelection.selected);
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.updateItem(nestedNode!, itemValue);
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    if (this.to.disabled != true) {
      if (this.to.apiEndpoint) {
        this.httpClient
          .get<any[]>(this.to.apiEndpoint, {
            params: createRequestOption(_.omitBy(plainToFlattenObject(_.assign({}, this.to.params)), _.isNull)),
            observe: 'response',
          })
          .pipe(
            map(res => res.body || []) // The original array
          )
          .subscribe(res => {
            this.to.items = this.to.childKey
              ? _.mapValues(_.keyBy(res, this.to.rootKey), this.to.childKey)
              : _.fromPairs(
                  _.map(_.keys(_.keyBy(res, this.to.rootKey)), e => {
                    return [e, null];
                  })
                );
            const data = this.buildFileTree(this.to.items, 0);
            // Notify the change.
            this.dataChange.next(data);
          });
      } else {
        const data = this.buildFileTree(this.to.items, 0);
        // Notify the change.
        this.dataChange.next(data);
      }
    }
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  parseSelected(selected: TodoItemFlatNode[]): void {
    let result = {};
    _.forEach(this.to.items, (v, k) => {
      if (_.isObject(v)) _.assign(result, this.parseNestedSelected(v, selected, k, this.to.items));
      else {
        if (_.find(selected, ['item', k])) {
          _.assign(result, _.set({}, `${k}`, true));
        } else {
          _.assign(result, _.set({}, `${k}`, false));
        }
      }
      // _.forEach(v, (e, c) => {
      //   if (_.isArray(v)) {
      //     if (_.find(selected, ['item', e])) {
      //       _.set(result, `${k}.${e}`, true);
      //     } else {
      //       _.set(result, `${k}.${e}`, false);
      //     }
      //   } else {
      //     if (_.find(selected, ['item', e])) {
      //       _.set(result, `${k}.${c}`, true);
      //     } else {
      //       _.set(result, `${k}.${c}`, false);
      //     }
      //   }
      // })
    });

    this.formControl.setValue(result);
  }

  // const TREE_DATA = {
  //   Groceries: {
  //     "Almond Meal flour": null,
  //     "Organic eggs": null,
  //     "Protein Powder": null,
  //     Fruits: {
  //       Apple: null,
  //       Berries: ["Blueberry", "Raspberry"],
  //       Orange: null,
  //     },
  //   },
  //   Reminders: [
  //     "Cook dinner",
  //     "Read the Material Design spec",
  //     "Upgrade Application to Angular",
  //   ],
  // };
  parseNestedSelected(object: any, pool: TodoItemFlatNode[], rootKey: string, origin: any): any {
    let result = {};

    // use for showing defaults
    const data = this.dataSource.data;
    const nestedNodeMap = this.nestedNodeMap;
    const checklistSelection = this.checklistSelection;

    function flatten(obj: any, prefix: string): void {
      _.forEach(obj, (ele, child) => {
        if (_.isArray(obj)) {
          if (_.find(pool, ['item', ele])) {
            _.set(result, `${prefix}.${ele}`, true);
          } else {
            _.set(result, `${prefix}.${ele}`, false);
          }
        } else {
          if (_.isObject(ele)) {
            _.forEach(ele, (v, k) => {
              if (_.isArray(v)) {
                flatten(v, `${prefix}.${child}.${k}`);
              } else {
                flatten(ele, `${prefix}.${child}`);
              }
            });
          } else {
            if (_.find(pool, ['item', child])) {
              _.set(result, `${prefix}.${child}`, true);
            } else {
              _.set(result, `${prefix}.${child}`, false);
            }

            // show defaults
            if (_.get(origin, `${prefix}.${child}`) === true) {
              if (data && nestedNodeMap) {
                nestedNodeMap.forEach(v => {
                  if (v.item === child) checklistSelection.select(v);
                });
              }
            }
          }
        }
      });
    }
    flatten(object, rootKey);

    return result;
  }

  ngAfterViewChecked(): void {
    const value = this.formControl.value;
    const data = this.dataSource.data;
    const nestedNodeMap = this.nestedNodeMap;
    const checklistSelection = this.checklistSelection;

    if (value) {
      _.forEach(value, (v, k) => {
        if (_.isObject(v)) this.parseNestedSelected(v, this.checklistSelection.selected, k, value);
        else {
          if (_.get(value, `${k}`) === true) {
            if (data) {
              nestedNodeMap.forEach(e => {
                if (e.item === k) checklistSelection.select(e);
              });
            }
          }
        }
      });
    }

    // hook to templateOptions.disabled to populate data in formly
    if (this.to.disabled != true && !this.to.items) {
      this.initialize();
      this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
      this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

      this.dataChange.subscribe(data => {
        this.dataSource.data = data;
        if (this.to.isCollapsed === true) {
          this.treeControl.expandAll();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.to.items && this.to.apiEndpoint) {
      this.to.items = null;
    }
  }
}
