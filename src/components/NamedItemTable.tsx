import React, {RefObject} from 'react';
import MaterialTable, { Column } from 'material-table';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from '../styles/App.styles';
import axios from 'axios';

const tableColumns: Array<Column<RowData>> = [
    { title: 'Name', field: 'name' },
    { title: 'Bezeichnung', field: 'bezeichnung' },
];

export interface HRef {
    href: string;
}

export interface Links {
    add?: HRef;
    update?: HRef;
    delete?: HRef;
}

export interface RowData {
    name: string;
    bezeichnung: string;
    _links?: Links;
}

interface Props {
    title: string;
    url: string;
    path: string;
}

const isEditable = (rowData: RowData) => (rowData._links && rowData._links.update && rowData._links.update.href ? true : false);
const isDelable = (rowData: RowData) => (rowData._links && rowData._links.delete && rowData._links.delete.href ? true : false);
const updatePath = (rowData?: RowData) => (rowData && rowData._links && rowData._links.update && rowData._links.update.href ? rowData._links.update.href : "");
const deletePath = (rowData?: RowData) => (rowData && rowData._links && rowData._links.delete && rowData._links.delete.href ? rowData._links.delete.href: "");

class NamedItemTable extends React.Component<Props> {
 
    render() {
        const url = this.props.url;
        const path = this.props.path;
        
        return (
            <MaterialTable
                title={this.props.title}
                columns={tableColumns}
                data={query =>
                    new Promise((resolve, reject) => {
                        let queryUrl = url + path + '?pageSize=' + query.pageSize + '&pageNumber=' + query.page;
                        axios.get(queryUrl)
                             .then(res => {
                                resolve({
                                    data: res.data._embedded.achsfolgModels,
                                    page: res.data.page.number,
                                    totalCount: res.data.page.totalElements
                                })
                            })
                    })
                }
                editable={{
                    isEditable: rowData => isEditable(rowData),
                    isEditHidden: rowData => !isEditable(rowData),
                    isDeletable: rowData => isDelable(rowData),
                    isDeleteHidden: rowData => !isDelable(rowData),
                    onRowAddCancelled: rowData => console.log("Row adding cancelled"),
                    onRowUpdateCancelled: rowData => console.log("Row editing cancelled"),
                    onRowAdd: newData => axios.post(url + path, { name: newData.name, bezeichnung: newData.bezeichnung }),
                    onRowUpdate: (newData, oldData) => axios.put(url + updatePath(oldData), { bezeichnung: newData.bezeichnung }),
                    onRowDelete: oldData => axios.delete(url + deletePath(oldData))
                }}
            />
        )
    }
}

export default withStyles(styles)(NamedItemTable);